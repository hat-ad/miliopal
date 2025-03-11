import {
  CreateUserInterface,
  CreateUserInternalInterface,
  GetUsersFilterInterface,
  UserSellingHistoryInterface,
  UserUpdateData,
} from "@/interfaces/user";
import UserRepository from "@/repository/user.repository";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

class UserService {
  static async createUser(data: CreateUserInterface): Promise<User> {
    return UserRepository.createUser(data);
  }
  static async createUserInternal(
    data: CreateUserInternalInterface
  ): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return UserRepository.createUserInternal(data);
  }

  static async updateUser(
    id: string,
    data: UserUpdateData
  ): Promise<User | null> {
    let updateData = { ...data };

    const user = await UserRepository.getUser(id);
    if (!user) return null;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return UserRepository.updateUser(id, updateData);
  }

  static async getUser(id: string): Promise<User | null> {
    return UserRepository.getUser(id);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return UserRepository.getUserByEmail(email);
  }

  static async getUsersList(
    filters: GetUsersFilterInterface,
    sortBy: "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number; totalPages: number }> {
    return UserRepository.getUsersList(filters, sortBy, sortOrder, page, limit);
  }

  static async deleteUser(id: string): Promise<User | null> {
    return UserRepository.deleteUser(id);
  }

  static async getUserSellingHistory(
    id: string
  ): Promise<UserSellingHistoryInterface | null> {
    return UserRepository.getUserSellingHistory(id);
  }

  static async sendResetPasswordEmail(
    userID: string,
    otp: string,
    otpExpiry: Date
  ): Promise<void> {
    await UserRepository.updateUser(userID, { otp, otpExpiry });
  }

  static async isOTPValid(userID: string, otp: string): Promise<boolean> {
    const user = await UserRepository.getUser(userID);
    if (!user) {
      return false;
    }
    if (user.otp !== otp) {
      return false;
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return false;
    }
    await UserRepository.updateUser(userID, {
      otp: null,
      otpExpiry: null,
    });

    return true;
  }

  static async resetPassword(userID: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserRepository.updateUser(userID, {
      otp: null,
      otpExpiry: null,
      password: hashedPassword,
    });
  }
}

export default UserService;
