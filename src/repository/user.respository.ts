import PrismaService from "@/db/prisma-service";
import { PrismaClient, Role, User } from "@prisma/client";

class UserRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createUser(data: {
    email: string;
    name?: string;
    password: string;
    role: Role;
  }): Promise<User> {
    return this.db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
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

  async updateUser(
    id: string,
    data: {
      email?: string;
      name?: string;
      password?: string;
      role?: string;
      token?: string;
    }
  ): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: {
        ...data,
        role: data.role as Role | undefined,
      },
    });
  }
}

export default new UserRepository();
