import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import { TodoListEvent } from "@prisma/client";

class SellerPurchaseStatsService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async notifyForSellersWithAnnualThresholdCrossed(): Promise<void> {
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);

        const todoListRepo = factory.getTodoListRepository();
        const sellerPurchaseStatsRepo =
          factory.getSellerPurchaseStatsRepository();

        const todoListSettings =
          await todoListRepo.listTodoListSettingsWithSellerSettingsEnabled();

        const orgIds = todoListSettings.map((s) => s.organizationId);
        const sellersStats =
          await sellerPurchaseStatsRepo.getSellerPurchaseStatsByOrganizationIdNonNotified(
            orgIds
          );

        const sellersNeededToBeNotified = [];
        const sellersWhoseStatsNeedsResetAfter12Months = [];
        for (const settings of todoListSettings) {
          const sellerStats = sellersStats.filter(
            (s) => s.organizationId === settings.organizationId
          );
          if (!sellerStats) continue;
          for (const seller of sellerStats) {
            const sellerWithReconciliationPeriodUnder12Months =
              seller.lastReconciledAt.getTime() >=
              new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000;

            const sellerWithReconciliationPeriodEndedAfter12Months =
              seller.lastReconciledAt.getTime() <
              new Date().getTime() - 12 * 30 * 24 * 60 * 60 * 1000;

            const isThresholdCrossed =
              seller.totalSales >=
              (settings.sellerSalesBalanceUpperThreshold as number);

            if (
              sellerWithReconciliationPeriodUnder12Months &&
              isThresholdCrossed
            ) {
              sellersNeededToBeNotified.push(seller);
            }

            if (sellerWithReconciliationPeriodEndedAfter12Months) {
              sellersWhoseStatsNeedsResetAfter12Months.push(seller);
            }
          }
        }

        for (const seller of sellersNeededToBeNotified) {
          await todoListRepo.registerEvent(
            TodoListEvent.SELLER_CASH_SALES_ABOVE_THRESHOLD,
            {
              organizationId: seller.organizationId,
              sellerId: seller.sellerId,
              totalSales: seller.totalSales,
              totalQuantity: seller.totalQuantity,
            }
          );

          await sellerPurchaseStatsRepo.markSellerStatsNotified(
            seller.sellerId
          );
        }

        for (const seller of sellersWhoseStatsNeedsResetAfter12Months) {
          await sellerPurchaseStatsRepo.resetSellerStats(seller.sellerId);
        }
      },
      { maxWait: 30000, timeout: 30000 }
    );
  }
}

export default SellerPurchaseStatsService;
