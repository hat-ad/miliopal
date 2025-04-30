import { PriceCategory } from "@prisma/client";
import BaseRepository from "./base.repository";
import {
  CreatePriceCategoryInterface,
  GetPriceCategoryFilterInterface,
} from "@/interfaces/price-category";

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

  async getPriceCategoryList(
    filters: GetPriceCategoryFilterInterface
  ): Promise<PriceCategory[]> {
    const priceCategories = await this.db.priceCategory.findMany({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,

        organizationId: filters.organizationId
          ? {
              contains: filters.organizationId,
              mode: "insensitive",
            }
          : undefined,
      },
    });

    return priceCategories;
  }
  async getPriceCategory(
    category: string,
    organizationId: string
  ): Promise<PriceCategory[]> {
    return this.db.priceCategory.findMany({
      where: {
        name: {
          equals: category,
          mode: "insensitive",
        },
        organizationId,
      },
    });
  }
}

export default PriceCategoryRepository;
