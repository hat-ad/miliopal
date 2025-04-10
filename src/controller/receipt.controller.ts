import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods } from "@/functions/function";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class ReceiptController {
  private static instance: ReceiptController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): ReceiptController {
    if (!ReceiptController.instance) {
      ReceiptController.instance = new ReceiptController(factory);
    }
    return ReceiptController.instance;
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
          currentOrderNumber: -1, // set currentOrderNumber to -1
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
