import BuyerRepository from "@/repository/buyer.repository";
import bcrypt from "bcrypt";
import { Buyer, Role } from "@prisma/client";

class BuyerService {
  static async createBuyer(data: {
    email: string;
    role: Role;
  }): Promise<Buyer> {
    return BuyerRepository.createBuyer(data);
  }

  static async updateBuyer(
    id: string,
    data: {
      name?: string;
      phone?: string;
      password?: string;
      token?: string;
      isDeleted?: boolean;
    }
  ): Promise<Buyer | null> {
    let updateData = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return BuyerRepository.updateBuyer(id, updateData);
  }

  static async login(email: string, password: string): Promise<Buyer | null> {
    const buyer = await BuyerRepository.getBuyerByEmail(email);
    if (!buyer) {
      throw new Error("User not found");
    }

    if (!buyer.password) {
      throw new Error("Password not set for this user");
    }

    const isPasswordValid = await bcrypt.compare(password, buyer.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return buyer;
  }

  static async getBuyer(id: string): Promise<Buyer | null> {
    return BuyerRepository.getBuyer(id);
  }

  static async getBuyerByEmail(email: string): Promise<Buyer | null> {
    return BuyerRepository.getBuyerByEmail(email);
  }

  static async getBuyersList(
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
  ): Promise<{ buyers: Buyer[]; total: number; totalPages: number }> {
    return BuyerRepository.getBuyersList(
      filters,
      sortBy,
      sortOrder,
      page,
      limit
    );
  }

  static async deleteBuyer(id: string): Promise<Buyer | null> {
    return BuyerRepository.deleteBuyer(id);
  }
}

export default BuyerService;
