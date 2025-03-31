import { ProductsPurchased } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import BaseRepository from "./base.repository";

class ProductsPurchasedRepository extends BaseRepository {
  async bulkInsertProductsPurchased(
    products: {
      productId: string;
      price: Decimal;
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

  async getPurchasedProductByPurchaseId(id: string) {
    return this.db.productsPurchased.findMany({
      where: {
        purchaseId: id,
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

  async getProductsPurchaseStatsByPurchaseIds(
    purchaseID: string[]
  ): Promise<{ units: number; expense: Decimal }> {
    const result = await this.db.productsPurchased.aggregate({
      _sum: { price: true, quantity: true },
      where: { purchaseId: { in: purchaseID } },
    });

    return {
      units: result._sum.quantity || 0,
      expense: result._sum.price || new Decimal(0),
    };
  }
}

export default ProductsPurchasedRepository;
