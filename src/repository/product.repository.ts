import PrismaService from "@/db/prisma-service";
import { PrismaClient, Product } from "@prisma/client";

class ProductRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createProduct(data: {
    name?: string;
    price: number;
    isDeleted?: boolean;
    isActive?: boolean;
  }): Promise<Product> {
    return this.db.product.create({
      data: {
        name: data.name,
        price: data.price,
        isDeleted: data.isDeleted,
        isActive: data.isActive,
      },
    });
  }

  async getProductsList(
    filters: {
      name?: string;
      price?: number;
      isActive?: boolean;
    },
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
        isActive:
          filters.isActive !== undefined
            ? { equals: filters.isActive }
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
        isActive:
          filters.isActive !== undefined
            ? { equals: filters.isActive }
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
    data: {
      name?: string;
      price?: number;
      isDeleted?: boolean;
      isActive?: boolean;
    }
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
        isActive: false,
      },
    });
  }
}

export default new ProductRepository();
