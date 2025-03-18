import { UserUpdateData } from "@/interfaces/user";
import { User } from "@prisma/client";
import BaseRepository from "./base.repository";

class AuthRepository extends BaseRepository {
  async getUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
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
}

export default AuthRepository;
