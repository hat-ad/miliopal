import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods } from "@/functions/function";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class ProductController {
  private static instance: ProductController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): ProductController {
    if (!ProductController.instance) {
      ProductController.instance = new ProductController(factory);
    }
    return ProductController.instance;
  }
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      const product = await this.serviceFactory
        .getProductService()
        .createProduct({
          ...req.body,
          organizationId,
        });
      return OK(res, product, "Product created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getProductsList(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, isArchived, page, limit } = req.query;

      const organizationId = req.payload?.organizationId;
      const pageSize = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        name: name ? String(name) : undefined,
        price: price ? parseFloat(price as string) : undefined,
        isArchived: isArchived ? isArchived === "true" : undefined,
        organizationId: organizationId as string,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;

      const products = await this.serviceFactory
        .getProductService()
        .getProductsList(filters, pageNumber, pageSize);

      return OK(res, products, "Products retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.serviceFactory
        .getProductService()
        .updateProduct(id, req.body);
      return OK(res, product, "Product updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.serviceFactory
        .getProductService()
        .deleteProduct(id);
      return OK(res, product, "Product deleted successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
