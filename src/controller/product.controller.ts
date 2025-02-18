import { OK, ERROR } from "@/utils/response-helper";
import { Request, Response } from "express";
import ProductService from "@/services/product.service";

export default class ProductController {
  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      return OK(res, product, "Product created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getProductsList(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, isActive, page } = req.query;

      const filters = {
        name: name ? String(name) : undefined,
        price: price ? parseFloat(price as string) : undefined,
        isActive: isActive ? isActive === "true" : undefined,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;

      const products = await ProductService.getProductsList(
        filters,
        pageNumber
      );

      return OK(res, products, "Products retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body);
      return OK(res, product, "Product updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductService.deleteProduct(id);
      return OK(res, product, "Product deleted successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
