import { Product } from "@prisma/client";
import ProductRepository from "@/repository/product.repository";

class ProductService {
  static async createProduct(data: {
    name: string;
    price: number;
    isDeleted?: boolean;
    isArchived?: boolean;
  }): Promise<Product> {
    return ProductRepository.createProduct(data);
  }

  static async getProductsList(
    filters: {
      name?: string;
      price?: number;
      isArchived?: boolean;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number; totalPages: number }> {
    return ProductRepository.getProductsList(filters, page, limit);
  }

  static async updateProduct(
    id: string,
    data: {
      name?: string;
      price?: number;
      isDeleted?: boolean;
      isArchived?: boolean;
    }
  ): Promise<Product | null> {
    return ProductRepository.updateProduct(id, data);
  }

  static async deleteProduct(id: string): Promise<Product | null> {
    return ProductRepository.deleteProduct(id);
  }
}

export default ProductService;
