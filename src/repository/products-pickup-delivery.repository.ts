import PrismaService from "@/db/prisma-service";
import { PrismaClient, ProductForDelivery } from "@prisma/client";

class ProductsPickupRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async bulkInsertProductsPurchased(
    products: {
      productId: string;
      quantity: number;
      pickUpDeliveryId: string;
    }[]
  ): Promise<ProductForDelivery[]> {
    if (products.length === 0) return [];

    await this.db.productForDelivery.createMany({
      data: products,
    });

    return this.db.productForDelivery.findMany({
      where: {
        pickUpDeliveryId: products[0].pickUpDeliveryId,
      },
      include: {
        pickUpDelivery: true,
        product: true,
      },
    });
  }
}

export default new ProductsPickupRepository();
