import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import { decrypt } from "@/utils/AES";
import {
  TodoList,
  TodoListEvent,
  TodoListSettings,
  TodoListStatus,
} from "@prisma/client";

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
        .getPickupDelivery(meta.pickUpOrderId, {
          include: {
            user: true,
            seller: {
              businessSeller: true,
            },
          },
        });

      if (!pickupOrder) {
        return null;
      }

      const decryptedUser = pickupOrder.user
        ? {
            ...pickupOrder.user,
            email: pickupOrder.user.email
              ? decrypt(pickupOrder.user.email)
              : null,
            phone: pickupOrder.user.phone
              ? decrypt(pickupOrder.user.phone)
              : null,
          }
        : null;

      const decryptedSeller = pickupOrder.seller
        ? {
            ...pickupOrder.seller,
            email: pickupOrder.seller.email
              ? decrypt(pickupOrder.seller.email)
              : null,
            phone: pickupOrder.seller.phone
              ? decrypt(pickupOrder.seller.phone)
              : null,
          }
        : null;

      return {
        ...pickupOrder,
        user: decryptedUser,
        seller: decryptedSeller,
      };
    }
  }

  private async getIndividualCashBalanceMetaDetails(todoList: TodoList) {
    if (todoList.meta) {
      const meta = todoList.meta as Record<string, string>;
      const user = await this.repositoryFactory
        .getUserRepository()
        .getUser(meta.userId);

      if (!user) {
        return null;
      }

      const decryptedUser = {
        ...user,
        email: user.email ? decrypt(user.email) : null,
        phone: user.phone ? decrypt(user.phone) : null,
      };

      return decryptedUser;
    }
  }

  private async getPrivateSellerMetaDetails(todoList: TodoList) {
    if (todoList.meta) {
      const meta = todoList.meta as Record<string, string>;
      const seller = await this.repositoryFactory
        .getSellerRepository()
        .getSeller(meta.sellerId);

      return { ...seller, ...meta };
    }
  }

  private async getPurchaseMetaDetails(todoList: TodoList) {
    if (todoList.meta) {
      const meta = todoList.meta as Record<string, string>;
      const purchase = await this.repositoryFactory
        .getPurchaseRepository()
        .getPurchase(meta.purchaseId, {
          include: {
            user: true,
            seller: {
              privateSeller: true,
              businessSeller: true,
            },
          },
        });

      if (!purchase) {
        return null;
      }
      const decryptedPurchaseDetails = {
        ...purchase,
        user: purchase?.user
          ? {
              ...purchase.user,
              email: purchase.user.email ? decrypt(purchase.user.email) : null,
              phone: purchase.user.phone ? decrypt(purchase.user.phone) : null,
            }
          : null,
        seller: purchase?.seller
          ? {
              ...purchase.seller,
              email: purchase.seller.email
                ? decrypt(purchase.seller.email)
                : null,
              phone: purchase.seller.phone
                ? decrypt(purchase.seller.phone)
                : null,
            }
          : null,
      };

      return decryptedPurchaseDetails;
    }
  }
  private async getCompanyCashBalanceMetaDetails(todoList: TodoList) {
    const organization = await this.repositoryFactory
      .getOrganizationRepository()
      .getOrganizationById(todoList.organizationId);

    return organization;
  }

  async getTodoList(
    organizationId: string,
    status?: TodoListStatus,
    event?: TodoListEvent,
    from?: Date,
    to?: Date
  ) {
    const todoLists = await this.repositoryFactory
      .getTodoListRepository()
      .listTodoLists(organizationId, status, event, from, to);

    const listWithData: (TodoList & { details: Record<string, unknown> })[] =
      [];

    for (const todoList of todoLists) {
      if (todoList.meta) {
        if (todoList.event === TodoListEvent.ORDER_PICKUP_INITIATED) {
          const metaDetails = await this.getOrderPickupInitiationMetaDetails(
            todoList
          );
          if (metaDetails) {
            listWithData.push({
              ...todoList,
              details: { pickUpDelivery: metaDetails },
            });
          }
        } else if (
          todoList.event === TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER
        ) {
          const metaDetails = await this.getPurchaseMetaDetails(todoList);
          if (metaDetails) {
            listWithData.push({
              ...todoList,
              details: { purchase: metaDetails },
            });
          }
        } else if (
          todoList.event === TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD
        ) {
          const metaDetails = await this.getCompanyCashBalanceMetaDetails(
            todoList
          );
          if (metaDetails) {
            listWithData.push({
              ...todoList,
              details: { organization: metaDetails },
            });
          }
        } else if (
          todoList.event ===
          TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD
        ) {
          const metaDetails = await this.getIndividualCashBalanceMetaDetails(
            todoList
          );
          if (metaDetails) {
            listWithData.push({ ...todoList, details: { user: metaDetails } });
          }
        } else if (
          todoList.event === TodoListEvent.PRIVATE_SELLER_SALES_ABOVE_THRESHOLD
        ) {
          const metaDetails = await this.getPrivateSellerMetaDetails(todoList);

          if (metaDetails) {
            listWithData.push({
              ...todoList,
              details: { seller: metaDetails },
            });
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
      isPrivateSellerSalesBalanceUpperThresholdEnabled: boolean;
    }
  ) {
    const payload = {
      companyCashBalanceLowerThreshold: data.companyCashBalanceLowerThreshold,
      individualCashBalanceLowerThreshold:
        data.individualCashBalanceLowerThreshold,
      privateSellerSalesBalanceUpperThreshold:
        data.privateSellerSalesBalanceUpperThreshold,
    };

    if (!data.isCompanyCashBalanceLowerThresholdEnabled) {
      payload.companyCashBalanceLowerThreshold = null;
    }
    if (!data.isIndividualCashBalanceLowerThresholdEnabled) {
      payload.individualCashBalanceLowerThreshold = null;
    }
    if (!data.isPrivateSellerSalesBalanceUpperThresholdEnabled) {
      payload.privateSellerSalesBalanceUpperThreshold = null;
    }

    return await this.repositoryFactory
      .getTodoListRepository()
      .updateTodoListSettings(organizationId, payload);
  }

  async completeTodoListTask(
    todoListId: string,
    event: TodoListEvent,
    payload: { paymentDate?: string; purchaseId?: string }
  ) {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);
      const todoListRepo = factory
        .getTodoListRepository()
        .completeEvent(event, {
          todoListId,
          paymentDate: payload.paymentDate,
          purchaseId: payload.purchaseId,
        });
      return todoListRepo;
    });
  }

  async getTodoListSettings(organizationId: string) {
    return await this.repositoryFactory
      .getTodoListRepository()
      .getTodoListSettings(organizationId);
  }
}

export default TodoListService;
