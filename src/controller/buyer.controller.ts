import { OK, ERROR, BAD } from "@/utils/response-helper";
import { Request, Response } from "express";
import BuyerService from "@/services/buyer.service";

export default class BuyerController {
  static async createBuyer(req: Request, res: Response): Promise<void> {
    try {
      const user = await BuyerService.createBuyer(req.body);
      return OK(res, user, "Buyer created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const buyer = await BuyerService.getBuyer(id);
      return OK(res, buyer, "Buyer retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getBuyersList(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, sortBy, sortOrder } = req.query;

      const filters = {
        name: name as string,
        email: email as string,
        phone: phone as string,
      };

      const sortedBy = "name";
      const sortedOrder = (sortOrder === "desc" ? "desc" : "asc") as
        | "asc"
        | "desc";

      const buyers = await BuyerService.getBuyersList(
        filters,
        sortedBy,
        sortedOrder
      );
      return OK(res, buyers, "Buyers retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async updateBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const buyer = await BuyerService.updateBuyer(id, req.body);
      return OK(res, buyer, "Buyer updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async deleteBuyer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const buyer = await BuyerService.deleteBuyer(id);
      return OK(res, buyer, "Buyer deleted successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
