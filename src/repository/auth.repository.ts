import PrismaService from "@/db/prisma-service";
import { User, PrismaClient, Role } from "@prisma/client";

class AuthRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
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
}

export default new AuthRepository();
