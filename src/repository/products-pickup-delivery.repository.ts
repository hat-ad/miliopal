import { ProductForDelivery } from "@prisma/client";
import BaseRepository from "./base.repository";

class ProductsPickupRepository extends BaseRepository {
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

export default ProductsPickupRepository;
