import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods } from "@/functions/function";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class PriceCategoryController {
  private static instance: PriceCategoryController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): PriceCategoryController {
    if (!PriceCategoryController.instance) {
      PriceCategoryController.instance = new PriceCategoryController(factory);
    }
    return PriceCategoryController.instance;
  }

  async createBulkPriceCategory(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;
      const { names } = req.body;

      if (!organizationId) {
        return ERROR(res, false, "Missing organization ID");
      }

      if (!Array.isArray(names) || names.length === 0) {
        return ERROR(res, false, "Invalid or empty 'names' array");
      }

      const priceCategories = names.map((name: string) => ({
        name,
        organizationId,
      }));

      const response = await this.serviceFactory
        .getPriceCategoryService()
        .createBulkPriceCategories(priceCategories, organizationId);

      return OK(res, response, "Price categories created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
