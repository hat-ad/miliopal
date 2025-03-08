import OrganizationService from "@/services/organization.service";
import ReceiptService from "@/services/receipt.service";
import SellerService from "@/services/seller.service";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class ReceiptController {
  static async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId as string;
      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }
      const org = await OrganizationService.getOrganizationById(organizationId);
      if (!org) return ERROR(res, false, "Organization not exist");

      const receipt = await ReceiptService.createReceipt({
        ...req.body,
        organizationId,
      });
      return OK(res, receipt, "Receipt created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getSingleReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const receipt = await ReceiptService.getSingleReceipt(id);
      return OK(res, receipt, "Receipt retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async updateReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const receipt = await ReceiptService.updateReceipt(id, req.body);
      return OK(res, receipt, "Receipt updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
