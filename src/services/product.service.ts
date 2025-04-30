import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreateProductInterface,
  GetProductsFilterInterface,
  UpdateProductInterface,
} from "@/interfaces/product";
import { Product, ProductPrice } from "@prisma/client";

class ProductService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async createProduct(data: CreateProductInterface): Promise<Product> {
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const productRepo = factory.getProductRepository();
        const productPriceRepo = factory.getProductPriceRepository();
        const priceCategoryRepo = factory.getPriceCategoryRepository();

        const product = await productRepo.createProduct(data);

        const priceCategories = await priceCategoryRepo.getPriceCategoryList({
          organizationId: data.organizationId,
        });

        const productPricesToCreate = priceCategories.map((category) => ({
          organizationId: data.organizationId,
          productId: product.id,
          priceCategoryId: category.id,
          price: 0,
        }));

        await productPriceRepo.bulkCreateProductPrice(productPricesToCreate);

        return product;
      },
      { maxWait: 30000, timeout: 30000 }
    );
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
