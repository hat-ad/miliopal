import AuthRepository from "@/repository/auth.repository";
import bcrypt from "bcrypt";
import { Purchase, PaymentMethod, OrderStatus, User } from "@prisma/client";
import purchaseRepository from "@/repository/purchase.repository";
import userRepository from "@/repository/user.repository";

class PurchaseService {
  static async createPurchase(data: {
    userId: string;
    sellerId: string;
    comment?: string;
    paymentMethod: PaymentMethod;
    bankAccountNumber?: string;
    status: OrderStatus;
  }): Promise<Purchase | null> {
    return purchaseRepository.createPurchase(data);
  }

  static async getPurchaseList(
    filters: {
      userId?: string;
      sellerId?: string;
      paymentMethod?: PaymentMethod;
      bankAccountNumber?: string;
      status?: OrderStatus;
      orderNo?: string;
    },
    sortBy: "orderNo" | "createdAt" | "status" = "createdAt", // ✅ Fix here
    sortOrder: "asc" | "desc" = "desc",
    page: number = 1,
    limit: number = 10
  ): Promise<{ purchases: Purchase[]; total: number; totalPages: number }> {
    return purchaseRepository.getPurchaseList(
      filters,
      sortBy,
      sortOrder,
      page,
      limit
    );
  }
}

export default PurchaseService;
