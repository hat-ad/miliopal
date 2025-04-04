import { PrivateSellerPurchaseStats } from "@prisma/client";
import BaseRepository from "./base.repository";

class PrivateSellerPurchaseStatsRepository extends BaseRepository {
  async createPrivateSellerPurchaseStats(
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

  async updatePrivateSellerPurchaseStats(
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

  async getPrivateSellerPurchaseStatsBySellerId(
    sellerId: string
  ): Promise<PrivateSellerPurchaseStats | null> {
    return this.db.privateSellerPurchaseStats.findUnique({
      where: {
        sellerId,
      },
    });
  }

  async getPrivateSellerPurchaseStatsByOrganizationIdNonNotified(
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

  async markPrivateSellerStatsNotified(sellerId: string): Promise<void> {
    await this.db.privateSellerPurchaseStats.update({
      where: {
        sellerId,
      },
      data: {
        isNotified: true,
      },
    });
  }

  async resetPrivateSellerStats(sellerId: string) {
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

export default PrivateSellerPurchaseStatsRepository;
