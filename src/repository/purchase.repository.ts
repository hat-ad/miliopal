import {
  CreatePurchaseRepositoryInterface,
  GetPurchaseFilterInterface,
  UpdatePurchaseInterface,
} from "@/interfaces/purchase";
import {
  BusinessSeller,
  PrivateSeller,
  Purchase,
  PurchaseType,
  Seller,
  User,
} from "@prisma/client";
import BaseRepository from "./base.repository";

class PurchaseRepository extends BaseRepository {
  async createPurchase(
    data: CreatePurchaseRepositoryInterface
  ): Promise<Purchase> {
    const purchase = await this.db.purchase.create({
      data: {
        orderNo: data.orderNo,
        userId: data.userId,
        sellerId: data.sellerId,
        organizationId: data.organizationId,
        comment: data.comment ?? null,
        paymentMethod: data.paymentMethod,
        bankAccountNumber: data.bankAccountNumber ?? null,
        status: data.status,
        totalAmount: data.totalAmount,
        notes: data.notes ?? null,
        transactionDate: data.transactionDate ?? null,
        purchaseType: data.purchaseType ?? PurchaseType.PURCHASE,
        priceCategoryId: data.priceCategoryId,
      },
    });

    return purchase;
  }

  async getPurchase(
    id: string,
    options?: {
      include: {
        user?: boolean;
        seller?: {
          privateSeller?: boolean;
          businessSeller?: boolean;
          baseSeller?: boolean;
        };
      };
    }
  ): Promise<
    | (Purchase & {
        user?: User | null;
        seller?:
          | (Seller & {
              privateSeller?: PrivateSeller;
              businessSeller?: BusinessSeller;
            })
          | null;
      })
    | null
  > {
    return this.db.purchase.findUnique({
      where: { id },
      include: {
        user: options?.include?.user || false,
        seller: options?.include?.seller?.baseSeller || {
          include: {
            privateSeller: options?.include?.seller?.privateSeller || false,
            businessSeller: options?.include?.seller?.businessSeller || false,
          },
        },
      },
    });
  }

  async getPurchaseList(
    filters: GetPurchaseFilterInterface,
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
      createdAt: {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to) } : {}),
      },
      organizationId: filters.organizationId
        ? {
            contains: filters.organizationId,
            mode: "insensitive",
          }
        : undefined,
    };

    if (filters.name) {
      whereCondition.OR = [
        { user: { name: { contains: filters.name, mode: "insensitive" } } },
        {
          seller: {
            privateSeller: {
              name: { contains: filters.name, mode: "insensitive" },
            },
          },
        },
        {
          seller: {
            businessSeller: {
              companyName: { contains: filters.name, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (filters.sellerType) {
      whereCondition.seller = {
        ...whereCondition.seller,
        type: filters.sellerType,
      };
    }
    const total = await this.db.purchase.count({ where: whereCondition });

    const purchases = await this.db.purchase.findMany({
      where: whereCondition,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
      include: {
        user: true,
        seller: {
          // where:{},
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
    orderNo: string,
    organizationId: string
  ): Promise<Purchase & { user: User; seller: Seller }> {
    const purchase = await this.db.purchase.findFirst({
      where: { orderNo, organizationId },
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

  async getPurchaseIds(filters: {
    userId?: string;
    sellerId?: string;
    organizationId?: string;
  }): Promise<string[]> {
    const whereClause: any = {
      purchaseType: PurchaseType.PURCHASE,
      creditOrderId: null,
    };

    if (filters.organizationId) {
      whereClause.organizationId = filters.organizationId;
    }

    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters.sellerId) {
      whereClause.sellerId = filters.sellerId;
    }

    const purchases = await this.db.purchase.findMany({
      where: whereClause,
      select: { id: true },
    });

    const purchaseIds = purchases.map((purchase) => purchase.id);
    return purchaseIds;
  }

  async updatePurchase(
    id: string,
    data: UpdatePurchaseInterface
  ): Promise<Purchase> {
    return this.db.purchase.update({
      where: { id },
      data: { ...data },
    });
  }
}

export default PurchaseRepository;
