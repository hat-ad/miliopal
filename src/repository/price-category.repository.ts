import { PriceCategory } from "@prisma/client";
import BaseRepository from "./base.repository";
import { CreatePriceCategoryInterface } from "@/interfaces/price-category";

class PriceCategoryRepository extends BaseRepository {
  async bulkInsertPriceCategory(
    categories: CreatePriceCategoryInterface[]
  ): Promise<PriceCategory[]> {
    if (categories.length === 0) return [];

    await this.db.priceCategory.createMany({
      data: categories,
    });

    return this.db.priceCategory.findMany({
      where: {
        organizationId: categories[0].organizationId,
      },
    });
  }
}

export default PriceCategoryRepository;
