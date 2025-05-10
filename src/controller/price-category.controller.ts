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

      //check for unique names
      const uniqueNames = new Set(
        names.map((name: string) => name.toLowerCase())
      );
      if (uniqueNames.size !== names.length) {
        return ERROR(res, false, "Names must be unique");
      }

      // Check for any existing category names
      for (const name of names) {
        const existing = await this.serviceFactory
          .getPriceCategoryService()
          .getPriceCategory(name, organizationId);
        if (existing.length > 0) {
          return ERROR(
            res,
            false,
            `Price category '${name}' already exists for this organization.`
          );
        }
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

  async getPriceCategoryList(req: Request, res: Response): Promise<void> {
    try {
      const { name, isArchived, page, limit } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const pageSize = limit ? parseInt(limit as string, 10) : 10;

      const organizationId = req.payload?.organizationId;

      const filters = {
        name: name ? String(name) : undefined,
        isArchived: isArchived ? isArchived === "true" : undefined,
        organizationId: organizationId as string,
      };

      const priceCategories = await this.serviceFactory
        .getPriceCategoryService()
        .getPriceCategoryList(filters, pageNumber, pageSize);

      return OK(res, priceCategories, "Categories retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async updatePriceCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const priceCategory = await this.serviceFactory
        .getPriceCategoryService()
        .updatePriceCategory(id, req.body);

      return OK(res, priceCategory, "Category updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
