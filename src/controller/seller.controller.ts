import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods, stringToHex } from "@/functions/function";
import { sendSellerInvitationMail } from "@/templates/email";
import { decrypt, encrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";
import { PaymentMethod } from "@prisma/client";
import { Request, Response } from "express";

export default class SellerController {
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
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

  async inviteSeller(req: Request, res: Response): Promise<void> {
    try {
      const { method, email, sellerType } = req.body;
      const inviteExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000);

      if (!sellerType) {
        return ERROR(res, false, "Seller type is required.");
      }

      if (method === "INVITE" && !email) {
        return ERROR(res, false, "Email is required for invitation.");
      }

      if (email) {
        const existingSeller = await this.serviceFactory
          .getSellerService()
          .getSellerByEmail(email);
        if (existingSeller) {
          return ERROR(res, false, "Seller already exists.");
        }
      }

      const sellerInvite = await this.serviceFactory
        .getSellerInviteService()
        .inviteSeller({ email, inviteExpiry, sellerType });

      if (!sellerInvite) {
        return ERROR(res, false, "Seller invitation not created.");
      }

      const inviteData = {
        id: sellerInvite.id,
        email,
        inviteExpiry,
      };

      const inviteCode = `${stringToHex(JSON.stringify(inviteData))}`;

      if (method === "INVITE") {
        await sendSellerInvitationMail(sellerInvite.id, email, inviteExpiry);
        return OK(res, inviteCode, "Seller invited successfully via email.");
      }

      return OK(res, inviteCode, "Invite link generated successfully.");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
  async checkingValidInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invitedSeller = await this.serviceFactory
        .getSellerInviteService()
        .getSellerInvite(id);

      if (!invitedSeller) {
        return ERROR(res, false, "Seller does not exist.");
      }

      if (!invitedSeller.inviteExpiry) {
        return ERROR(res, false, "Invalid invitation expiry.");
      }

      const currentTime = new Date();
      const inviteExpiry = new Date(invitedSeller.inviteExpiry);

      if (currentTime > inviteExpiry) {
        return ERROR(res, null, "Invitation has expired.");
      }

      return OK(res, invitedSeller, "Invitation is valid.");
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
      const { page, limit, from, to, paymentMethod } = req.query;
      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const pageSize = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        paymentMethod: paymentMethod
          ? (paymentMethod as PaymentMethod)
          : undefined,
        from: from ? new Date(from as string).toISOString() : undefined,
        to: to ? new Date(to as string).toISOString() : undefined,
      };

      const sellerSellingHistory = await this.serviceFactory
        .getSellerService()
        .getSellerSellingHistory(id, pageNumber, pageSize, filters);

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
        total: sellerSellingHistory?.total,
        totalPages: sellerSellingHistory?.totalPages,
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
