import PrismaService from "@/db/prisma-service";
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
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const productRepo = factory.getProductRepository();
        const productPriceRepo = factory.getProductPriceRepository();
        const priceCategoryRepo = factory.getPriceCategoryRepository();

        const product = await productRepo.createProduct(data);

        const priceCategories = await priceCategoryRepo.getPriceCategories({
          organizationId: data.organizationId,
        });

        const priceCategoryMap = data.prices.reduce((acc, category) => {
          acc[category.priceCategoryId] = category.price;
          return acc;
        }, {} as Record<string, number>);

        const productPricesToCreate = priceCategories.map((category) => ({
          organizationId: data.organizationId,
          productId: product.id,
          priceCategoryId: category.id,
          price: priceCategoryMap[category.id] || 0,
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
    data: UpdateProductInterface & {
      ProductPrice: { id: string; price: number }[];
    }
  ): Promise<Product | null> {
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const productRepo = factory.getProductRepository();
        const productPriceRepo = factory.getProductPriceRepository();

        const { ProductPrice, ...productData } = data;

        const updatedProduct = await productRepo.updateProduct(id, productData);
        if (!updatedProduct) return null;

        if (Array.isArray(ProductPrice)) {
          for (const item of ProductPrice) {
            await productPriceRepo.updateProductPriceById(item.id, {
              price: item.price,
            });
          }
        }
        return updatedProduct;
      },
      { maxWait: 30000, timeout: 30000 }
    );
  }

  async deleteProduct(id: string): Promise<Product | null> {
    return this.repositoryFactory.getProductRepository().deleteProduct(id);
  }
}

export default ProductService;
