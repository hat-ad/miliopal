import { OK, ERROR } from "@/utils/response-helper";
import { Request, Response } from "express";
import SellerService from "@/services/seller.service";

export default class SellerController {
  static async createSeller(req: Request, res: Response): Promise<void> {
    try {
      const user = await SellerService.createSeller(req.body);
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
        name,
        email,
        phone,
        address,
        postalCode,
        city,
        type,
        sortBy,
        sortOrder,
      } = req.query;

      const filters = {
        name: name as string,
        email: email as string,
        phone: phone as string,
        address: address as string,
        postalCode: postalCode as string,
        city: city as string,
        type: type as "PRIVATE" | "BUSINESS" | undefined,
      };

      const sortedBy = (sortBy === "city" ? "city" : "name") as "name" | "city";
      const sortedOrder = (sortOrder === "desc" ? "desc" : "asc") as
        | "asc"
        | "desc";

      const sellers = await SellerService.getSellersList(
        filters,
        sortedBy,
        sortedOrder
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
}
