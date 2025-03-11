import {
  CreatePurchaseInterface,
  GetPurchaseFilterInterface,
} from "@/interfaces/purchase";
import purchaseRepository from "@/repository/purchase.repository";
import { Purchase, Seller, User } from "@prisma/client";

class PurchaseService {
  static async createPurchase(
    data: CreatePurchaseInterface
  ): Promise<Purchase | null> {
    return purchaseRepository.createPurchase(data);
  }

  static async getPurchase(id: string): Promise<Purchase | null> {
    return purchaseRepository.getPurchase(id);
  }

  static async getPurchaseList(
    filters: GetPurchaseFilterInterface,
    sortBy: "orderNo" | "createdAt" | "status" = "createdAt", // ✅ Fix here
    sortOrder: "asc" | "desc" = "desc",
    page: number = 1,
    limit: number = 10
  ): Promise<{
    purchases: (Purchase & { user?: User | null; seller?: Seller | null })[];
    total: number;
    totalPages: number;
  }> {
    return purchaseRepository.getPurchaseList(
      filters,
      sortBy,
      sortOrder,
      page,
      limit
    );
  }

  static async getReceiptByOrderNo(
    orderNo: string,
    organizationId: string
  ): Promise<(Purchase & { user: User; seller: Seller }) | null> {
    return purchaseRepository.getReceiptByOrderNo(orderNo, organizationId);
  }
}

export default PurchaseService;
