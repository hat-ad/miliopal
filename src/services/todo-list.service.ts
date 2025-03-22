import { RepositoryFactory } from "@/factory/repository.factory";
import { TodoList, TodoListEvent, TodoListSettings } from "@prisma/client";

class TodoListService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  private async getOrderPickupInitiationMetaDetails(todoList: TodoList) {
    if (todoList.meta) {
      const meta = todoList.meta as Record<string, string>;
      const pickupOrder = await this.repositoryFactory
        .getPickUpDeliveryRepository()
        .getPickupDelivery(meta.pickUpOrderId);

      return pickupOrder;
    }
  }

  private async getIndividualCashBalanceMetaDetails(todoList: TodoList) {
    if (todoList.meta) {
      const meta = todoList.meta as Record<string, string>;
      const user = await this.repositoryFactory
        .getUserRepository()
        .getUser(meta.userId);

      return user;
    }
  }

  private async getPurchaseMetaDetails(todoList: TodoList) {
    if (todoList.meta) {
      const meta = todoList.meta as Record<string, string>;
      const purchase = await this.repositoryFactory
        .getPurchaseRepository()
        .getPurchase(meta.purchaseId);

      return purchase;
    }
  }
  private async getCompanyCashBalanceMetaDetails(todoList: TodoList) {
    if (todoList.meta) {
      const meta = todoList.meta as Record<string, string>;
      const purchase = await this.repositoryFactory
        .getPurchaseRepository()
        .getPurchase(meta.purchaseId);

      return purchase;
    }
  }

  async getTodoList(organizationId: string) {
    const todoLists = await this.repositoryFactory
      .getTodoListRepository()
      .listTodoLists(organizationId);

    const listWithData: (TodoList & { details: Record<string, unknown> })[] =
      [];

    for (const todoList of todoLists) {
      if (todoList.meta) {
        if (todoList.event === TodoListEvent.ORDER_PICKUP_INITIATED) {
          const metaDetails = await this.getOrderPickupInitiationMetaDetails(
            todoList
          );
          if (metaDetails) {
            listWithData.push({ ...todoList, details: metaDetails });
          }
        } else if (
          todoList.event === TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER
        ) {
          const metaDetails = await this.getPurchaseMetaDetails(todoList);
          if (metaDetails) {
            listWithData.push({ ...todoList, details: metaDetails });
          }
        } else if (
          todoList.event === TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD
        ) {
          const metaDetails = await this.getCompanyCashBalanceMetaDetails(
            todoList
          );
          if (metaDetails) {
            listWithData.push({ ...todoList, details: metaDetails });
          }
        } else if (
          todoList.event ===
          TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD
        ) {
          const metaDetails = await this.getIndividualCashBalanceMetaDetails(
            todoList
          );
          if (metaDetails) {
            listWithData.push({ ...todoList, details: metaDetails });
          }
        }
      }
    }

    return listWithData;
  }

  async updateTodoListSettings(
    organizationId: string,
    data: Partial<
      Omit<
        TodoListSettings,
        "organizationId" | "id" | "createdAt" | "updatedAt"
      >
    > & {
      isCompanyCashBalanceLowerThresholdEnabled: boolean;
      isIndividualCashBalanceLowerThresholdEnabled: boolean;
      isIndividualCashBalanceUpperThresholdEnabled: boolean;
    }
  ) {
    const payload = {
      companyCashBalanceLowerThreshold: data.companyCashBalanceLowerThreshold,
      individualCashBalanceLowerThreshold:
        data.individualCashBalanceLowerThreshold,
      individualCashBalanceUpperThreshold:
        data.individualCashBalanceUpperThreshold,
    };

    if (!data.isCompanyCashBalanceLowerThresholdEnabled) {
      payload.companyCashBalanceLowerThreshold = null;
    }
    if (!data.isIndividualCashBalanceLowerThresholdEnabled) {
      payload.individualCashBalanceLowerThreshold = null;
    }
    if (!data.isIndividualCashBalanceUpperThresholdEnabled) {
      payload.individualCashBalanceUpperThreshold = null;
    }

    return await this.repositoryFactory
      .getTodoListRepository()
      .updateTodoListSettings(organizationId, payload);
  }

  async getTodoListSettings(organizationId: string) {
    return await this.repositoryFactory
      .getTodoListRepository()
      .getTodoListSettings(organizationId);
  }
}

export default TodoListService;
