import PrismaService from "@/db/prisma-service";
import {
  OrderStatus,
  PaymentMethod,
  PrismaClient,
  Purchase,
  Seller,
  User,
} from "@prisma/client";

class PurchaseRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }
  async createPurchase(data: {
    userId: string;
    sellerId: string;
    organizationId: string;
    comment?: string;
    paymentMethod: PaymentMethod;
    bankAccountNumber?: string;
    status: OrderStatus;
    orderNo: string;
  }): Promise<Purchase> {
    return this.db.purchase.create({
      data: {
        orderNo: data.orderNo,
        userId: data.userId,
        sellerId: data.sellerId,
        organizationId: data.organizationId,
        comment: data.comment ?? null,
        paymentMethod: data.paymentMethod,
        bankAccountNumber: data.bankAccountNumber ?? null,
        status: data.status,
      },
    });
  }

  async getPurchaseList(
    filters: {
      userId?: string;
      sellerId?: string;
      paymentMethod?: PaymentMethod;
      bankAccountNumber?: string;
      status?: OrderStatus;
      orderNo?: string;
      organizationId?: string;
    },
    sortBy: "orderNo" | "createdAt" | "status" = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    page: number = 1,
    limit: number = 10
  ): Promise<{
    purchases: (Purchase & { user?: User | null; seller?: Seller | null })[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const whereCondition: any = {
      userId: filters.userId || undefined,
      sellerId: filters.sellerId || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      bankAccountNumber: filters.bankAccountNumber || undefined,
      status: filters.status || undefined,
      orderNo: filters.orderNo ? { contains: filters.orderNo } : undefined,
      organizationId: filters.organizationId
        ? {
            contains: filters.organizationId,
            mode: "insensitive",
          }
        : undefined,
    };

    const total = await this.db.purchase.count({ where: whereCondition });

    const purchases = await this.db.purchase.findMany({
      where: whereCondition,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
      include: {
        user: true,
        seller: {
          include: {
            privateSeller: true,
            businessSeller: true,
          },
        },
        productsPurchased: {
          include: {
            product: true,
          },
        },
      },
    });

    const transformedPurchases = purchases.map((purchase) => {
      const seller = purchase.seller
        ? {
            ...purchase.seller,
            ...purchase.seller.privateSeller,
            ...purchase.seller.businessSeller,
          }
        : null;

      return {
        ...purchase,
        seller,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return { purchases: transformedPurchases, total, totalPages };
  }

  async getReceiptByOrderNo(
    orderNo: string
  ): Promise<Purchase & { user: User; seller: Seller }> {
    const purchase = await this.db.purchase.findUnique({
      where: { orderNo },
      include: {
        user: true,
        seller: {
          include: {
            privateSeller: true,
            businessSeller: true,
          },
        },
        productsPurchased: {
          include: {
            product: true,
          },
        },
        organization: true,
      },
    });

    if (!purchase) {
      throw new Error(`No purchase found with orderNo: ${orderNo}`);
    }

    return purchase as Purchase & { user: User; seller: Seller };
  }
}

export default new PurchaseRepository();
