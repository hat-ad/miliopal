import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import { TodoListEvent } from "@prisma/client";

class PrivateSellerPurchaseStatsService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async notifyForSellersWithAnnualThresholdCrossed(): Promise<void> {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);

      const todoListRepo = factory.getTodoListRepository();
      const privateSellerPurchaseStatsRepo =
        factory.getPrivateSellerPurchaseStatsRepository();

      const todoListSettings =
        await todoListRepo.listTodoListSettingsWithPrivateSellerSettingsEnabled();

      const orgIds = todoListSettings.map((s) => s.organizationId);
      const privateSellersStats =
        await privateSellerPurchaseStatsRepo.getPrivateSellerPurchaseStatsByOrganizationIdNonNotified(
          orgIds
        );

      const sellersNeededToBeNotified = [];
      const sellersWhoseStatsNeedsResetAfter12Months = [];
      for (const settings of todoListSettings) {
        const sellerStats = privateSellersStats.find(
          (s) => s.organizationId === settings.organizationId
        );
        if (!sellerStats) continue;

        const sellerWithReconciliationPeriodUnder12Months =
          sellerStats.lastReconciledAt.getTime() >=
          new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000;

        const sellerWithReconciliationPeriodEndedAfter12Months =
          sellerStats.lastReconciledAt.getTime() <
          new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000;

        const isThresholdCrossed =
          sellerStats.totalSales >=
          (settings.privateSellerSalesBalanceUpperThreshold as number);

        if (sellerWithReconciliationPeriodUnder12Months && isThresholdCrossed) {
          sellersNeededToBeNotified.push(sellerStats);
        }

        if (sellerWithReconciliationPeriodEndedAfter12Months) {
          sellersWhoseStatsNeedsResetAfter12Months.push(sellerStats);
        }
      }

      for (const seller of sellersNeededToBeNotified) {
        await todoListRepo.registerEvent(
          TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
          {
            organizationId: seller.organizationId,
            sellerId: seller.sellerId,
            totalSales: seller.totalSales,
            totalQuantity: seller.totalQuantity,
          }
        );

        await privateSellerPurchaseStatsRepo.markPrivateSellerStatsNotified(
          seller.sellerId
        );
      }

      for (const seller of sellersWhoseStatsNeedsResetAfter12Months) {
        await privateSellerPurchaseStatsRepo.resetPrivateSellerStats(
          seller.sellerId
        );
      }
    });
  }
}

export default PrivateSellerPurchaseStatsService;
