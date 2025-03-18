import { ServiceFactory } from "@/factory/service.factory";
import { decrypt, encrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class SellerController {
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
  }

  static getInstance(factory?: ServiceFactory): SellerController {
    return new SellerController(factory);
  }
  async createSeller(req: Request, res: Response): Promise<void> {
    try {
      const { email, phone } = req.body;
      const organizationId = req.payload?.organizationId;

      const encryptedEmail = encrypt(email);
      const encryptedPhone = phone ? encrypt(phone) : null;

      let seller = await this.serviceFactory
        .getSellerService()
        .getSellerByEmail(encryptedEmail);
      if (seller) return ERROR(res, false, "Seller already exist");

      seller = await this.serviceFactory.getSellerService().createSeller({
        ...req.body,
        email: encryptedEmail,
        phone: encryptedPhone,
        organizationId,
      });

      const responseSeller = {
        ...seller,
        email: seller?.email ? decrypt(seller.email) : null,
        phone: seller?.phone ? decrypt(seller.phone) : null,
      };

      return OK(res, responseSeller, "Seller created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seller = await this.serviceFactory.getSellerService().getSeller(id);

      const responseSeller = {
        ...seller,
        email: seller?.email ? decrypt(seller.email) : null,
        phone: seller?.phone ? decrypt(seller.phone) : null,
      };
      return OK(res, responseSeller, "Seller retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getSellersList(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        type,
        name,
        phone,
        address,
        postalCode,
        city,
        companyName,
        contactPerson,
        organizationNumber,
        isArchived,
        sortBy,
        sortOrder,
        page,
      } = req.query;

      const organizationId = req.payload?.organizationId;

      const encryptedEmail = email ? encrypt(email as string) : undefined;
      const encryptedPhone = phone ? encrypt(phone as string) : undefined;

      const filters = {
        ...(encryptedEmail && { email: encryptedEmail }),
        ...(encryptedPhone && { phone: encryptedPhone }),
        ...(organizationId && { organizationId }),
        ...(name && { name: name as string }),
        ...(address && { address: address as string }),
        ...(postalCode && { postalCode: postalCode as string }),
        ...(city && { city: city as string }),
        ...(companyName && { companyName: companyName as string }),
        ...(contactPerson && { contactPerson: contactPerson as string }),
        ...(organizationNumber && {
          organizationNumber: organizationNumber as string,
        }),
        ...(type &&
          (type === "PRIVATE" || type === "BUSINESS") && {
            type: type as "PRIVATE" | "BUSINESS",
          }),
        ...(isArchived !== undefined && { isArchived: isArchived === "true" }),
      };

      const sortedBy: "name" | "city" = sortBy === "city" ? "city" : "name";
      const sortedOrder: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";
      const pageNumber = !isNaN(Number(page))
        ? parseInt(page as string, 10)
        : 1;

      const { sellers, total, totalPages } = await this.serviceFactory
        .getSellerService()
        .getSellersList(filters, sortedBy, sortedOrder, pageNumber);

      const responseSellers = sellers.map((seller) => ({
        ...seller,
        email: seller.email ? decrypt(seller.email) : null,
        phone: seller.phone ? decrypt(seller.phone) : null,
      }));

      return OK(
        res,
        { sellers: responseSellers, total, totalPages },
        "Sellers retrieved successfully"
      );
    } catch (error) {
      return ERROR(res, false, error || "Error retrieving sellers");
    }
  }

  async updateSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email, phone } = req.body;

      const encryptedEmail = email ? encrypt(email) : null;
      const encryptedPhone = phone ? encrypt(phone) : null;

      const seller = await this.serviceFactory
        .getSellerService()
        .updateSeller(id, {
          ...req.body,
          email: encryptedEmail,
          phone: encryptedPhone,
        });

      const responseSeller = {
        ...seller,
        email: seller?.email ? decrypt(seller.email) : null,
        phone: seller?.phone ? decrypt(seller.phone) : null,
      };
      return OK(res, responseSeller, "Seller updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async deleteSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seller = await this.serviceFactory
        .getSellerService()
        .deleteSeller(id);

      const responseSeller = {
        ...seller,
        email: seller?.email ? decrypt(seller.email) : null,
        phone: seller?.phone ? decrypt(seller.phone) : null,
      };
      return OK(res, responseSeller, "Seller deleted successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getSellerSellingHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sellerSellingHistory = await this.serviceFactory
        .getSellerService()
        .getSellerSellingHistory(id);

      const decryptedSeller = {
        ...sellerSellingHistory?.seller,
        email: sellerSellingHistory?.seller?.email
          ? decrypt(sellerSellingHistory.seller.email)
          : null,
        phone: sellerSellingHistory?.seller?.phone
          ? decrypt(sellerSellingHistory.seller.phone)
          : null,
      };

      const decryptedPurchases = sellerSellingHistory?.purchase.map(
        (purchase) => ({
          ...purchase,
          user: purchase?.user
            ? {
                ...purchase?.user,
                email: purchase?.user.email
                  ? decrypt(purchase.user.email)
                  : null,
                name: purchase?.user.name ? decrypt(purchase.user.name) : null,
                phone: purchase?.user.phone
                  ? decrypt(purchase.user.phone)
                  : null,
              }
            : null,
        })
      );

      const responseSeller = {
        ...sellerSellingHistory,
        seller: decryptedSeller,
        purchase: decryptedPurchases,
      };

      return OK(
        res,
        responseSeller,
        "Seller selling history retrived successfully"
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
