import ProductsPurchasedRepository from "@/repository/products-purchased.repository";
import { ProductsPurchased } from "@prisma/client";

class ProductsPurchasedService {
  static async addProductsToPurchase(
    purchaseId: string,
    products: {
      productId: string;
      price: number;
      quantity: number;
    }[]
  ): Promise<ProductsPurchased[]> {
    const productsData = products.map((product) => ({
      ...product,
      purchaseId,
    }));

    return ProductsPurchasedRepository.bulkInsertProductsPurchased(
      productsData
    );
  }
}

export default ProductsPurchasedService;
