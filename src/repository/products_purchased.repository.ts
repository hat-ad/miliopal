import PrismaService from "@/db/prisma-service";
import { PrismaClient, ProductsPurchased } from "@prisma/client";

class ProductsPurchasedRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

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
    });
  }
}

export default new ProductsPurchasedRepository();
