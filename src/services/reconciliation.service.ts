import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreateReconciliationHistoryInterface,
  FilterReconciliationListInterface,
} from "@/interfaces/reconciliation";
import {
  Organization,
  Receipt,
  ReconciliationHistory,
  TodoListEvent,
  User,
} from "@prisma/client";

class ReconciliationHistoryService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }
  async createReconciliation(
    data: CreateReconciliationHistoryInterface
  ): Promise<{ reconciliationHistory: ReconciliationHistory; user: User }> {
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const userRepo = factory.getUserRepository();
        const todoListRepo = factory.getTodoListRepository();
        const reconciliationHistoryRepo =
          factory.getReconciliationHistoryRepository();

        const user = await userRepo.getUser(data.userId);

        if (!user) throw new Error("User not found.");

        const reconciliation =
          await reconciliationHistoryRepo.createReconciliation(data);

        const updatedUser = await userRepo.updateUser(data.userId, {
          lastReconciled: new Date(),
          wallet: data.amountCounted,
        });

        await todoListRepo.registerEvent(
          TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD,
          { organizationId: user.organizationId, userId: user.id }
        );

        return { reconciliationHistory: reconciliation, user: updatedUser! };
      },
      { maxWait: 60000, timeout: 60000 }
    );
  }

  async getReconciliationList(
    filters: FilterReconciliationListInterface,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reconciliations: (ReconciliationHistory & { user?: User | null })[];
    total: number;
    totalPages: number;
  }> {
    return this.repositoryFactory
      .getReconciliationHistoryRepository()
      .getReconciliationList(filters, page, limit);
  }

  async getReconciliation(id: number): Promise<
    | (ReconciliationHistory & {
        user?: User | null;
        reconciliator?: User | null;
        organization?: Organization | null;
      })
    | null
  > {
    return this.repositoryFactory
      .getReconciliationHistoryRepository()
      .getReconciliation(id);
  }

  async getReconciliationReceipt(id: number): Promise<{
    reconciliation:
      | (ReconciliationHistory & {
          user?: User | null;
          reconciliator?: User | null;
          organization?: Organization | null;
        })
      | null;
    receiptSettings: Receipt | null;
  }> {
    const reconciliation = await this.repositoryFactory
      .getReconciliationHistoryRepository()
      .getReconciliation(id);
    const receiptSettings = await this.repositoryFactory
      .getReceiptRepository()
      .getReceiptByOrganizationId(reconciliation?.organizationId as string);

    return {
      reconciliation,
      receiptSettings,
    };
  }
}

export default ReconciliationHistoryService;
