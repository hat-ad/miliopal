import PrismaService from "@/db/prisma-service";
import {
  PrismaClient,
  Purchase,
  PaymentMethod,
  OrderStatus,
} from "@prisma/client";

class PurchaseRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }
  async createPurchase(data: {
    userId: string;
    sellerId: string;
    comment?: string;
    paymentMethod: PaymentMethod;
    bankAccountNumber?: string;
    status: OrderStatus;
  }): Promise<Purchase> {
    return this.db.purchase.create({
      data: {
        orderNo: `ORD-${Date.now()}`,
        userId: data.userId,
        sellerId: data.sellerId,
        comment: data.comment ?? null,
        paymentMethod: data.paymentMethod,
        bankAccountNumber: data.bankAccountNumber ?? null,
        status: data.status,
      },
    });
  }
}

export default new PurchaseRepository();
