import { PriceCategory, Prisma } from "@prisma/client";
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
    filters: GetPriceCategoryFilterInterface,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    priceCategories: PriceCategory[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const whereClause = {
      name: filters.name
        ? { contains: filters.name, mode: Prisma.QueryMode.insensitive }
        : undefined,
      isArchived:
        filters.isArchived !== undefined ? filters.isArchived : undefined,
      organizationId: filters.organizationId
        ? {
            contains: filters.organizationId,
            mode: Prisma.QueryMode.insensitive,
          }
        : undefined,
    };

    const total = await this.db.priceCategory.count({
      where: whereClause,
    });

    const priceCategories = await this.db.priceCategory.findMany({
      where: whereClause,
      orderBy: { isArchived: "asc" },
      take: limit,
      skip: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return { priceCategories, total, totalPages };
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
