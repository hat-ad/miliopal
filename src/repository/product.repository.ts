import {
  CreateProductInterface,
  GetProductsFilterInterface,
  UpdateProductInterface,
} from "@/interfaces/product";
import { Prisma, Product } from "@prisma/client";
import BaseRepository from "./base.repository";

class ProductRepository extends BaseRepository {
  async createProduct(data: CreateProductInterface): Promise<Product> {
    return this.db.product.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        isDeleted: data.isDeleted,
        isArchived: data.isArchived,
      },
    });
  }

  async getProductsList(
    filters: GetProductsFilterInterface,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number; totalPages: number }> {
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

      isDeleted: false,
    };

    const total = await this.db.product.count({
      where: whereClause,
      orderBy: { isArchived: "asc" },
    });

    const products = await this.db.product.findMany({
      where: whereClause,
      orderBy: { isArchived: "asc" },
      include: {
        ProductPrice: filters.priceCategoryId
          ? {
              where: { priceCategoryId: filters.priceCategoryId },
            }
          : true,
      },
      take: limit,
      skip: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return { products, total, totalPages };
  }

  async updateProduct(
    id: string,
    data: UpdateProductInterface
  ): Promise<Product> {
    return this.db.product.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    return this.db.product.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}

export default ProductRepository;
