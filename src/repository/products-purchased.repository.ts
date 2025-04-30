import { ProductsPurchased } from "@prisma/client";
import BaseRepository from "./base.repository";

class ProductsPurchasedRepository extends BaseRepository {
  async bulkInsertProductsPurchased(
    products: {
      productId: string;
      price: number;
      categoryPrice: number;
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
    productId?: string;
    purchaseIds: string[];
  }): Promise<ProductsPurchased[]> {
    if (!filter.productId) {
      return this.db.productsPurchased.findMany({
        where: {
          purchaseId: { in: filter.purchaseIds }, // Filter by purchase IDs
        },
      });
    } else {
      return this.db.productsPurchased.findMany({
        where: {
          purchaseId: { in: filter.purchaseIds }, // Filter by purchase IDs
          productId: filter.productId,
        },
      });
    }
  }

  // async getProductsPurchaseStatsByPurchaseIds(
  //   purchaseID: string[]
  // ): Promise<{ units: number; expense: number }> {
  //   const result = await this.db.productsPurchased.aggregate({
  //     _sum: { price: true, quantity: true },
  //     where: { purchaseId: { in: purchaseID } },
  //   });

  //   return {
  //     units: result._sum.quantity || 0,
  //     expense: result._sum.price || 0,
  //   };
  // }

  async getProductsPurchaseStatsByPurchaseIds(
    purchaseIds: string[]
  ): Promise<{ units: number; expense: number }> {
    if (!purchaseIds.length) {
      return { units: 0, expense: 0 };
    }

    const result = await this.db.productsPurchased.findMany({
      where: { purchaseId: { in: purchaseIds } },
      select: { price: true, quantity: true },
    });

    const units = result.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    const expense = result.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
      0
    );

    return { units, expense };
  }
}

export default ProductsPurchasedRepository;
