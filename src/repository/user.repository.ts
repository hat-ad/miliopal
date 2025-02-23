import PrismaService from "@/db/prisma-service";
import { User, PrismaClient, Role } from "@prisma/client";

class UserRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
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
      token?: string;
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
    },
    sortBy: "name" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const total = await this.db.user.count({
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

    const users = await this.db.user.findMany({
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
}

export default new UserRepository();
