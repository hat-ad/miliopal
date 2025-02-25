import AuthRepository from "@/repository/auth.repository";
import bcrypt from "bcrypt";
import { Purchase, PaymentMethod, OrderStatus } from "@prisma/client";
import purchaseRepository from "@/repository/purchase.repository";

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
}

export default PurchaseService;
