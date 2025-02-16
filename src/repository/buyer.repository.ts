import PrismaService from "@/db/prisma-service";
import { Buyer, PrismaClient } from "@prisma/client";

class BuyerRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createBuyer(data: {
    name?: string;
    email: string;
    phone: string;
    isDeleted?: boolean;
  }): Promise<Buyer> {
    return this.db.buyer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        isDeleted: data.isDeleted,
      },
    });
  }

  async getBuyer(id: string): Promise<Buyer | null> {
    return this.db.buyer.findUnique({
      where: { id },
    });
  }

  async getBuyersList(
    filters: {
      name?: string;
      email?: string;
      phone?: string;
    },
    sortBy: "name",
    sortOrder: "asc" | "desc" = "asc"
  ): Promise<Buyer[]> {
    return this.db.buyer.findMany({
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
        isDeleted: false,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async updateBuyer(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
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
