import { ProductsPurchased } from "@prisma/client";
import BaseRepository from "./base.repository";

class ProductsPurchasedRepository extends BaseRepository {
  async bulkInsertProductsPurchased(
    products: {
      productId: string;
      price: number;
      quantity: number;
      purchaseId: string;
    }[]
  ): Promise<ProductsPurchased[]> {
    if (products.length === 0) return [];

    await this.db.productsPurchased.createMany({
      data: products,
    });

    return this.db.productsPurchased.findMany({
      where: {
        purchaseId: products[0].purchaseId,
      },
      include: {
        purchase: true,
        product: true,
      },
    });
  }
  async getPurchasesByProductId(filter: {
    productId: string;
    purchaseIds: string[];
  }): Promise<ProductsPurchased[]> {
    return this.db.productsPurchased.findMany({
      where: {
        purchaseId: { in: filter.purchaseIds }, // Filter by purchase IDs
        productId: filter.productId,
      },
    });
  }
}

export default ProductsPurchasedRepository;
