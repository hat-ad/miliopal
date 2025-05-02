import { PrivateSellerPurchaseStats } from "@prisma/client";
import BaseRepository from "./base.repository";

class SellerPurchaseStatsRepository extends BaseRepository {
  async createSellerPurchaseStats(
    sellerId: string,
    organizationId: string
  ): Promise<void> {
    await this.db.privateSellerPurchaseStats.create({
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
    return this.db.privateSellerPurchaseStats.update({
      where: {
        sellerId: sellerId,
      },
      data: body,
    });
  }

  async getSellerPurchaseStatsBySellerId(
    sellerId: string
  ): Promise<PrivateSellerPurchaseStats | null> {
    return this.db.privateSellerPurchaseStats.findUnique({
      where: {
        sellerId,
      },
    });
  }

  async getSellerPurchaseStatsByOrganizationIdNonNotified(
    organizationId: string[]
  ): Promise<PrivateSellerPurchaseStats[]> {
    return this.db.privateSellerPurchaseStats.findMany({
      where: {
        organizationId: {
          in: organizationId,
        },
        isNotified: false,
      },
    });
  }

  async markSellerStatsNotified(sellerId: string): Promise<void> {
    await this.db.privateSellerPurchaseStats.update({
      where: {
        sellerId,
      },
      data: {
        isNotified: true,
      },
    });
  }

  async resetSellerStats(sellerId: string) {
    await this.db.privateSellerPurchaseStats.update({
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
