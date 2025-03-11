import {
  CreateSellerInterface,
  GetSellersFilterInterface,
  SellerSellingHistoryInterface,
  UpdateSellerInterface,
} from "@/interfaces/seller";
import SellerRepository from "@/repository/seller.repository";
import {
  Organization,
  Purchase,
  Seller,
  SellerType,
  User,
} from "@prisma/client";

class SellerService {
  static async createSeller(data: CreateSellerInterface): Promise<Seller> {
    return SellerRepository.createSeller(data);
  }

  static async getSeller(id: string): Promise<Seller | null> {
    return SellerRepository.getSeller(id);
  }

  static async getSellerByEmail(email: string): Promise<Seller | null> {
    return SellerRepository.getSellerByEmail(email);
  }

  static async getSellersList(
    filters: GetSellersFilterInterface,
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
    data: UpdateSellerInterface
  ): Promise<Seller | null> {
    return SellerRepository.updateSeller(id, data);
  }

  static async deleteSeller(id: string): Promise<Seller | null> {
    return SellerRepository.deleteSeller(id);
  }

  static async getSellerSellingHistory(
    id: string
  ): Promise<SellerSellingHistoryInterface | null> {
    return SellerRepository.getSellerSellingHistory(id);
  }
}

export default SellerService;
