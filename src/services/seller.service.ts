import bcrypt from "bcrypt";
import { Buyer, Seller, SellerType } from "@prisma/client";
import SellerRepository from "@/repository/seller.repository";

class SellerService {
  static async createSeller(data: {
    name?: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    isDeleted?: boolean;
    type: SellerType;
  }): Promise<Seller> {
    return SellerRepository.createSeller(data);
  }

  static async getSeller(id: string): Promise<Seller | null> {
    return SellerRepository.getSeller(id);
  }

  static async getSellerByEmail(email: string): Promise<Buyer | null> {
    return SellerRepository.getSellerByEmail(email);
  }

  static async getSellersList(
    filters: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      type?: SellerType;
    },
    sortBy: "name" | "city" = "name",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ sellers: Seller[]; total: number; totalPages: number }> {
    return SellerRepository.getSellersList(
      filters,
      sortBy,
      sortOrder,
      page,
      limit
    );
  }

  static async updateSeller(
    id: string,
    data: {
      name?: string;
      email: string;
      phone: string;
      address: string;
      postalCode: string;
      city: string;
      isDeleted?: boolean;
      type: SellerType;
    }
  ): Promise<Seller | null> {
    return SellerRepository.updateSeller(id, data);
  }

  static async deleteSeller(id: string): Promise<Seller | null> {
    return SellerRepository.deleteSeller(id);
  }
}

export default SellerService;
