import { ServiceFactory } from "@/factory/service.factory";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class ReceiptController {
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
  }

  static getInstance(factory?: ServiceFactory): ReceiptController {
    return new ReceiptController(factory);
  }
  async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId as string;
      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }
      const org = await this.serviceFactory
        .getReceiptService()
        .getReceiptByOrganizationId(organizationId);
      if (org) return ERROR(res, false, "Organization receipt already exist!");

      const receipt = await this.serviceFactory
        .getReceiptService()
        .createReceipt({
          ...req.body,
          organizationId,
        });
      return OK(res, receipt, "Receipt created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getSingleReceipt(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;
      if (!organizationId)
        return ERROR(res, false, "Organization ID is required.");
      const receipt = await this.serviceFactory
        .getReceiptService()
        .getReceiptByOrganizationId(organizationId);
      return OK(res, receipt, "Receipt retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async updateReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const receipt = await this.serviceFactory
        .getReceiptService()
        .updateReceipt(id, req.body);
      return OK(res, receipt, "Receipt updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
