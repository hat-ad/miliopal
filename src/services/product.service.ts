import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreateProductInterface,
  GetProductsFilterInterface,
  UpdateProductInterface,
} from "@/interfaces/product";
import { Product } from "@prisma/client";

class ProductService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async createProduct(data: CreateProductInterface): Promise<Product> {
    return this.repositoryFactory.getProductRepository().createProduct(data);
  }

  async getProductsList(
    filters: GetProductsFilterInterface,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number; totalPages: number }> {
    return this.repositoryFactory
      .getProductRepository()
      .getProductsList(filters, page, limit);
  }

  async updateProduct(
    id: string,
    data: UpdateProductInterface
  ): Promise<Product | null> {
    return this.repositoryFactory
      .getProductRepository()
      .updateProduct(id, data);
  }

  async deleteProduct(id: string): Promise<Product | null> {
    return this.repositoryFactory.getProductRepository().deleteProduct(id);
  }
}

export default ProductService;
