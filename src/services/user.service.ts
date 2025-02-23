import UserRepository from "@/repository/user.repository";
import bcrypt from "bcrypt";
import { User, Role } from "@prisma/client";

class UserService {
  static async createUser(data: { email: string; role: Role }): Promise<User> {
    return UserRepository.createUser(data);
  }
  static async createUserInternal(data: {
    email: string;
    role: Role;
    password?: string;
    phone?: string;
  }): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return UserRepository.createUserInternal(data);
  }

  static async updateUser(
    id: string,
    data: {
      name?: string;
      phone?: string;
      password?: string;
      token?: string;
      isDeleted?: boolean;
    }
  ): Promise<User | null> {
    let updateData = { ...data };

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
    filters: {
      name?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
    },
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
}

export default UserService;
