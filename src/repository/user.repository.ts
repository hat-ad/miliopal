import PrismaService from "@/db/prisma-service";
import { Prisma, PrismaClient, Purchase, Role, User } from "@prisma/client";

class UserRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createUserInternal(data: {
    email: string;
    role?: Role;
    password?: string;
    phone?: string;
  }): Promise<User> {
    return this.db.user.create({
      data: data,
    });
  }

  async createUser(data: { email: string; role: Role }): Promise<User> {
    return this.db.user.create({
      data: {
        email: data.email,
        role: data.role ?? Role.USER,
      },
    });
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      phone?: string;
      password?: string;
      isActive?: boolean;
      isArchived?: boolean;
      isDeleted?: boolean;
    }
  ): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async getUser(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async getUsersList(
    filters: {
      name?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      isArchived?: boolean;
    },
    sortBy: "name" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const whereCondition: Prisma.UserWhereInput = {
      name: filters.name
        ? { contains: filters.name, mode: Prisma.QueryMode.insensitive }
        : undefined,
      email: filters.email
        ? { contains: filters.email, mode: Prisma.QueryMode.insensitive }
        : undefined,
      phone: filters.phone
        ? { contains: filters.phone, mode: Prisma.QueryMode.insensitive }
        : undefined,
      isActive: filters.isActive !== undefined ? filters.isActive : undefined,
      isArchived:
        filters.isArchived !== undefined ? filters.isArchived : undefined,
      isDeleted: false,
    };

    const total = await this.db.user.count({ where: whereCondition });

    const users = await this.db.user.findMany({
      where: whereCondition,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return { users, total, totalPages };
  }

  async deleteUser(id: string): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  async getUserSellingHistory(
    id: string
  ): Promise<{ buyer: User; purchase: Purchase[] } | null> {
    const userSellingHistory = await this.db.user.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            seller: {
              include: {
                privateSeller: true,
                businessSeller: true,
              },
            },
            productsPurchased: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!userSellingHistory) {
      return null;
    }
    const response = {
      buyer: userSellingHistory,
      purchase: userSellingHistory.purchases,
    };
    response.buyer.purchases = [];
    return response;
  }
}

export default new UserRepository();
