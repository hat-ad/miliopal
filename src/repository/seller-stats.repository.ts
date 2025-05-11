import { PrivateSellerPurchaseStats } from "@prisma/client";
import BaseRepository from "./base.repository";

class SellerPurchaseStatsRepository extends BaseRepository {
  async createSellerPurchaseStats(
    sellerId: string,
    organizationId: string
  ): Promise<void> {
    await this.db.sellerPurchaseStats.create({
      data: {
        sellerId,
        organizationId,
      },
    });
  }

  async updateSellerPurchaseStats(
    sellerId: string,
    body: Omit<
      Partial<PrivateSellerPurchaseStats>,
      "id" | "sellerId" | "createdAt" | "updatedAt"
    >
  ): Promise<PrivateSellerPurchaseStats> {
    return this.db.sellerPurchaseStats.update({
      where: {
        sellerId: sellerId,
      },
      data: body,
    });
  }

  async getSellerPurchaseStatsBySellerId(
    sellerId: string
  ): Promise<PrivateSellerPurchaseStats | null> {
    return this.db.sellerPurchaseStats.findUnique({
      where: {
        sellerId,
      },
    });
  }

  async getSellerPurchaseStatsByOrganizationIdNonNotified(
    organizationId: string[]
  ): Promise<PrivateSellerPurchaseStats[]> {
    return this.db.sellerPurchaseStats.findMany({
      where: {
        organizationId: {
          in: organizationId,
        },
        isNotified: false,
      },
    });
  }

  async markSellerStatsNotified(sellerId: string): Promise<void> {
    await this.db.sellerPurchaseStats.update({
      where: {
        sellerId,
      },
      data: {
        isNotified: true,
      },
    });
  }

  async resetSellerStats(sellerId: string) {
    await this.db.sellerPurchaseStats.update({
      where: {
        sellerId,
      },
      data: {
        lastReconciledAt: new Date(),
        isNotified: false,
        totalQuantity: 0,
        totalSales: 0,
      },
    });
  }
}

export default SellerPurchaseStatsRepository;
