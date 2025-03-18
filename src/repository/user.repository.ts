import {
  CreateUserInterface,
  CreateUserInternalInterface,
  GetUsersFilterInterface,
  UserSellingHistoryInterface,
  UserUpdateData,
} from "@/interfaces/user";
import { Prisma, Role, User } from "@prisma/client";
import BaseRepository from "./base.repository";

class UserRepository extends BaseRepository {
  async createUserInternal(data: CreateUserInternalInterface): Promise<User> {
    return this.db.user.create({
      data: {
        email: data.email,
        organizationId: data.organizationId,
        name: data.name,
        password: data.password,
        phone: data.phone,
        role: Role.SUPERADMIN,
      },
    });
  }

  async createUser(data: CreateUserInterface): Promise<User> {
    return this.db.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role ?? Role.USER,
        organizationId: data.organizationId,
      },
    });
  }

  async updateUser(id: string, data: UserUpdateData): Promise<User> {
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
      include: {
        purchases: true,
        organization: true,
      },
    });
  }

  async getUserByEmail(
    email: string,
    organizationId?: string
  ): Promise<User | null> {
    if (organizationId) {
      return this.db.user.findUnique({
        where: { email, organizationId },
      });
    }
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async getUsersList(
    filters: GetUsersFilterInterface,
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
      organizationId: filters.organizationId
        ? {
            contains: filters.organizationId,
            mode: Prisma.QueryMode.insensitive,
          }
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
  ): Promise<UserSellingHistoryInterface | null> {
    const userSellingHistory = await this.db.user.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            seller: {
              include: {
                privateSeller: true,
                businessSeller: true,
                organization: true,
              },
            },
            productsPurchased: {
              include: {
                product: true,
              },
            },
          },
        },
        organization: true,
      },
    });

    if (!userSellingHistory) {
      return null;
    }

    const { purchases, organization, ...userDetails } = userSellingHistory;

    const response = {
      buyer: {
        ...userDetails,
      },
      purchase: purchases,
      organization: organization ?? null,
    };

    return response;
  }
}

export default UserRepository;
