import SellerService from "@/services/seller.service";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class SellerController {
  static async createSeller(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const organizationId = req.payload?.organizationId;

      const seller = await SellerService.getSellerByEmail(email);
      if (seller) return ERROR(res, false, "Seller already exist");

      const user = await SellerService.createSeller({
        ...req.body,
        organizationId,
      });
      return OK(res, user, "Seller created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seller = await SellerService.getSeller(id);
      return OK(res, seller, "Seller retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getSellersList(req: Request, res: Response): Promise<void> {
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

      const filters = {
        name: name as string,
        email: email as string,
        phone: phone as string,
        address: address as string,
        postalCode: postalCode as string,
        city: city as string,
        companyName: companyName as string,
        contactPerson: contactPerson as string,
        organizationNumber: organizationNumber
          ? parseFloat(organizationNumber as string)
          : undefined,
        type: type as "PRIVATE" | "BUSINESS" | undefined,
        isArchived: isArchived ? isArchived === "true" : undefined,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;

      const sortedBy = (sortBy === "city" ? "city" : "name") as "name" | "city";
      const sortedOrder = (sortOrder === "desc" ? "desc" : "asc") as
        | "asc"
        | "desc";

      const sellers = await SellerService.getSellersList(
        filters,
        sortedBy,
        sortedOrder,
        pageNumber
      );
      return OK(res, sellers, "Sellers retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async updateSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seller = await SellerService.updateSeller(id, req.body);
      return OK(res, seller, "Seller updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async deleteSeller(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seller = await SellerService.deleteSeller(id);
      return OK(res, seller, "Seller deleted successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getSellerSellingHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sellerSellingHistory = await SellerService.getSellerSellingHistory(
        id
      );

      return OK(
        res,
        sellerSellingHistory,
        "Seller selling history retrived successfully"
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
