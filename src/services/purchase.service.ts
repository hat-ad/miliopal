import {
  Purchase,
  PaymentMethod,
  OrderStatus,
  User,
  Seller,
} from "@prisma/client";
import purchaseRepository from "@/repository/purchase.repository";

class PurchaseService {
  static async createPurchase(data: {
    userId: string;
    sellerId: string;
    comment?: string;
    paymentMethod: PaymentMethod;
    bankAccountNumber?: string;
    status: OrderStatus;
    organizationId: string;
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
      organizationId?: string;
    },
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
    orderNo: string
  ): Promise<(Purchase & { user: User; seller: Seller }) | null> {
    return purchaseRepository.getReceiptByOrderNo(orderNo);
  }
}

export default PurchaseService;
