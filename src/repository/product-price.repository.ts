import { ProductPrice } from "@prisma/client";
import BaseRepository from "./base.repository";
import { CreateProductPriceInterface } from "@/interfaces/product-price";

class ProductPriceRepository extends BaseRepository {
  async bulkCreateProductPrice(
    data: CreateProductPriceInterface[]
  ): Promise<ProductPrice[]> {
    if (data.length === 0) return [];

    await this.db.productPrice.createMany({
      data: data,
      skipDuplicates: true,
    });

    return this.db.productPrice.findMany({
      where: {
        priceCategoryId: {
          in: data.map((d) => d.priceCategoryId),
        },
      },
    });
  }

  async updateProductPriceById(
    id: string,
    data: { price: number }
  ): Promise<void> {
    await this.db.productPrice.update({
      where: { id },
      data,
    });
  }
}

export default ProductPriceRepository;
