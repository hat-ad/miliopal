import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreatePriceCategoryInterface,
  GetPriceCategoryFilterInterface,
  UpdatePriceCategoryInterface,
} from "@/interfaces/price-category";
import { CreateProductPriceInterface } from "@/interfaces/product-price";
import { PriceCategory, ProductPrice } from "@prisma/client";

class PriceCategoryService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async createBulkPriceCategories(
    priceCategories: CreatePriceCategoryInterface[],
    organizationId: string
  ): Promise<{
    newCategories: PriceCategory[];
    productPrices: ProductPrice[];
  }> {
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const productRepo = factory.getProductRepository();
        const priceCategoryRepo = factory.getPriceCategoryRepository();
        const productPriceRepo = factory.getProductPriceRepository();

        // 1. New Price Categories
        const newCategories = await priceCategoryRepo.bulkInsertPriceCategory(
          priceCategories
        );
        const { products } = await productRepo.getProductsList({
          organizationId,
        });

        const productPricesToCreate: CreateProductPriceInterface[] = [];
        for (const product of products) {
          for (const category of newCategories) {
            productPricesToCreate.push({
              organizationId,
              productId: product.id,
              priceCategoryId: category.id,
              price: 0,
            });
          }
        }
        const productPrices = await productPriceRepo.bulkCreateProductPrice(
          productPricesToCreate
        );
        return { newCategories, productPrices };
      },
      { maxWait: 30000, timeout: 30000 }
    );
  }

  async getPriceCategoryList(
    filters: GetPriceCategoryFilterInterface,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    priceCategories: PriceCategory[];
    total: number;
    totalPages: number;
  }> {
    return this.repositoryFactory
      .getPriceCategoryRepository()
      .getPriceCategoryList(filters, page, limit);
  }

  async getPriceCategory(
    category: string,
    organizationId: string
  ): Promise<PriceCategory[]> {
    return this.repositoryFactory
      .getPriceCategoryRepository()
      .getPriceCategory(category, organizationId);
  }

  async updatePriceCategory(
    id: string,
    data: UpdatePriceCategoryInterface
  ): Promise<PriceCategory | null> {
    return this.repositoryFactory
      .getPriceCategoryRepository()
      .updatePriceCategory(id, data);
  }
}

export default PriceCategoryService;
