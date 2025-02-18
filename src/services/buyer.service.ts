import BuyerRepository from "@/repository/buyer.repository";
import { Buyer } from "@prisma/client";

class BuyerService {
  static async createBuyer(data: {
    name?: string;
    email: string;
    phone: string;
    isDeleted?: boolean;
  }): Promise<Buyer> {
    return BuyerRepository.createBuyer(data);
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

  static async updateBuyer(
    id: string,
    data: {
      name?: string;
      email: string;
      phone: string;
      isDeleted?: boolean;
    }
  ): Promise<Buyer | null> {
    return BuyerRepository.updateBuyer(id, data);
  }

  static async deleteBuyer(id: string): Promise<Buyer | null> {
    return BuyerRepository.deleteBuyer(id);
  }
}

export default BuyerService;
