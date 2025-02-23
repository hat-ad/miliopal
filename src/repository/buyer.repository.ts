import PrismaService from "@/db/prisma-service";
import { Buyer, PrismaClient, Role } from "@prisma/client";

class BuyerRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createBuyer(data: { email: string; role: Role }): Promise<Buyer> {
    return this.db.buyer.create({
      data: {
        email: data.email,
        role: data.role ?? Role.USER,
      },
    });
  }

  async updateBuyer(
    id: string,
    data: {
      name?: string;
      phone?: string;
      password?: string;
      token?: string;
      isDeleted?: boolean;
    }
  ): Promise<Buyer> {
    return this.db.buyer.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async getBuyer(id: string): Promise<Buyer | null> {
    return this.db.buyer.findUnique({
      where: { id },
    });
  }

  async getBuyerByEmail(email: string): Promise<Buyer | null> {
    return this.db.buyer.findUnique({
      where: { email },
    });
  }
  async getBuyersList(
    filters: {
      name?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
    },
    sortBy: "name" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ buyers: Buyer[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const total = await this.db.buyer.count({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,
        email: filters.email
          ? { contains: filters.email, mode: "insensitive" }
          : undefined,
        phone: filters.phone
          ? { contains: filters.phone, mode: "insensitive" }
          : undefined,
        isActive: filters.isActive ?? false,
        isDeleted: false,
      },
    });

    const buyers = await this.db.buyer.findMany({
      where: {
        name: filters.name
          ? { contains: filters.name, mode: "insensitive" }
          : undefined,
        email: filters.email
          ? { contains: filters.email, mode: "insensitive" }
          : undefined,
        phone: filters.phone
          ? { contains: filters.phone, mode: "insensitive" }
          : undefined,
        isActive: filters.isActive ?? false,
        isDeleted: false,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      take: limit,
      skip: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return { buyers, total, totalPages };
  }

  async deleteBuyer(id: string): Promise<Buyer> {
    return this.db.buyer.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}

export default new BuyerRepository();
