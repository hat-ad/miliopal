import PrismaService from "@/db/prisma-service";
import {
  CreateProductInterface,
  GetProductsFilterInterface,
  UpdateProductInterface,
} from "@/interfaces/product";
import { PrismaClient, Product } from "@prisma/client";

class ProductRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createProduct(data: CreateProductInterface): Promise<Product> {
    return this.db.product.create({
      data: {
        name: data.name,
        price: data.price,
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

    const total = await this.db.product.count({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,
        price:
          filters.price !== undefined ? { equals: filters.price } : undefined,

        isArchived:
          filters.isArchived !== undefined
            ? { equals: filters.isArchived }
            : undefined,
        organizationId: filters.organizationId
          ? {
              contains: filters.organizationId,
              mode: "insensitive",
            }
          : undefined,
        isDeleted: false,
      },
    });

    const products = await this.db.product.findMany({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,
        price:
          filters.price !== undefined ? { equals: filters.price } : undefined,

        isArchived:
          filters.isArchived !== undefined ? filters.isArchived : undefined,

        organizationId: filters.organizationId
          ? {
              contains: filters.organizationId,
              mode: "insensitive",
            }
          : undefined,
        isDeleted: false,
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

export default new ProductRepository();
