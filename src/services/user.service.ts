import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreateUserInterface,
  CreateUserInternalInterface,
  GetUsersFilterInterface,
  UserSellingHistoryInterface,
  UserUpdateData,
} from "@/interfaces/user";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

class UserService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }
  async createUser(data: CreateUserInterface): Promise<User> {
    return this.repositoryFactory.getUserRepository().createUser(data);
  }
  async createUserInternal(data: CreateUserInternalInterface): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.repositoryFactory.getUserRepository().createUserInternal(data);
  }

  async updateUser(id: string, data: UserUpdateData): Promise<User | null> {
    let updateData = { ...data };

    const user = await this.repositoryFactory.getUserRepository().getUser(id);
    if (!user) return null;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.repositoryFactory
      .getUserRepository()
      .updateUser(id, updateData);
  }

  async getUser(id: string): Promise<User | null> {
    return this.repositoryFactory.getUserRepository().getUser(id);
  }

  async getUserByEmail(
    email: string,
    organizationId?: string
  ): Promise<User | null> {
    return this.repositoryFactory
      .getUserRepository()
      .getUserByEmail(email, organizationId);
  }

  async getUsersList(
    filters: GetUsersFilterInterface,
    sortBy: "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    return this.repositoryFactory
      .getUserRepository()
      .getUsersList(filters, sortBy, sortOrder, page, limit);
  }

  async deleteUser(id: string): Promise<User | null> {
    return this.repositoryFactory.getUserRepository().deleteUser(id);
  }

  async getUserSellingHistory(
    id: string
  ): Promise<UserSellingHistoryInterface | null> {
    return this.repositoryFactory.getUserRepository().getUserSellingHistory(id);
  }

  async sendResetPasswordEmail(
    userID: string,
    otp: string,
    otpExpiry: Date
  ): Promise<void> {
    await this.repositoryFactory
      .getUserRepository()
      .updateUser(userID, { otp, otpExpiry });
  }

  async isOTPValid(userID: string, otp: string): Promise<boolean> {
    const user = await this.repositoryFactory
      .getUserRepository()
      .getUser(userID);
    if (!user) {
      return false;
    }
    if (user.otp !== otp) {
      return false;
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return false;
    }
    await this.repositoryFactory.getUserRepository().updateUser(userID, {
      otp: null,
      otpExpiry: null,
    });

    return true;
  }

  async resetPassword(userID: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.repositoryFactory.getUserRepository().updateUser(userID, {
      otp: null,
      otpExpiry: null,
      password: hashedPassword,
    });
  }
}

export default UserService;
