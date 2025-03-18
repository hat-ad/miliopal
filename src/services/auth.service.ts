import { RepositoryFactory } from "@/factory/repository.factory";
import { UserUpdateData } from "@/interfaces/user";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

class AuthService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.repositoryFactory
      .getAuthRepository()
      .getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error("Password not set for this user");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return user;
  }
  async updateUser(id: string, data: UserUpdateData): Promise<User | null> {
    let updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.repositoryFactory
      .getAuthRepository()
      .updateUser(id, updateData);
  }
}

export default AuthService;
