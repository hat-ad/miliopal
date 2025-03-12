import ProductsPickupRepository from "@/repository/products-pickup-delivery.repository";
import { ProductForDelivery } from "@prisma/client";

class ProductsPickupService {
  static async addProductsToPickup(
    pickUpDeliveryId: string,
    products: {
      productId: string;
      quantity: number;
    }[]
  ): Promise<ProductForDelivery[]> {
    const productsData = products.map((product) => ({
      ...product,
      pickUpDeliveryId,
    }));

    return ProductsPickupRepository.bulkInsertProductsPurchased(productsData);
  }
}

export default ProductsPickupService;
