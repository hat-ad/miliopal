import {
  OrderStatus,
  TodoListEvent,
  TodoListSettings,
  TodoListStatus,
} from "@prisma/client";
import BaseRepository from "./base.repository";

class TodoListRepository extends BaseRepository {
  async registerEvent(
    event: TodoListEvent,
    payload: {
      userId?: string;
      organizationId: string;
      pickUpOrderId?: string;
      purchaseId?: string;
      totalSales?: number;
      totalQuantity?: number;
      sellerId?: string;
    }
  ) {
    switch (event) {
      case TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD:
        await this.handleCompanyCashBalanceBelowThresholdEvent(
          payload.organizationId
        );
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD:
        await this.handleIndividualCashBalanceBelowThresholdEvent(
          payload.userId || "",
          payload.organizationId
        );
        break;
      case TodoListEvent.ORDER_PICKUP_INITIATED:
        await this.handleCreateOrderPickupEvent(
          payload.organizationId,
          payload.pickUpOrderId || ""
        );
        break;
      case TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER:
        await this.handleCreatePurchaseWithBankTransferEvent(
          payload.organizationId,
          payload.purchaseId || ""
        );
        break;
      case TodoListEvent.PRIVATE_SELLER_SALES_ABOVE_THRESHOLD:
        await this.handleCreatePrivateSellerUpperThresholdEvent(
          payload.organizationId,
          payload?.sellerId || "",
          payload?.totalSales || 0,
          payload?.totalQuantity || 0
        );
        break;
      default:
        break;
    }
  }

  async completeEvent(
    event: TodoListEvent,
    payload: {
      todoListId: string;
      paymentDate?: string;
      purchaseId?: string;
    }
  ) {
    switch (event) {
      case TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD:
        await this.completeTodoListEvent(payload.todoListId);
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD:
        await this.completeTodoListEvent(payload.todoListId);
        break;
      case TodoListEvent.ORDER_PICKUP_INITIATED:
        await this.completeTodoListEvent(payload.todoListId);
        break;
      case TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER:
        if (!payload.paymentDate || !payload.purchaseId) {
          throw new Error("Payment date and purchase id are required");
        }
        await this.completeTodoListEvent(payload.todoListId);
        await this.updatePaymentDate(payload.purchaseId, payload.paymentDate);
        break;
      case TodoListEvent.PRIVATE_SELLER_SALES_ABOVE_THRESHOLD:
        await this.completeTodoListEvent(payload.todoListId);
        break;
      default:
        break;
    }
  }

  async listTodoLists(
    organizationId: string,
    status?: TodoListStatus,
    event?: TodoListEvent,
    from?: Date,
    to?: Date
  ) {
    return await this.db.todoList.findMany({
      where: {
        organizationId,
        status,
        event,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { priority: "asc" },
    });
  }

  async createTodoListSettings(organizationId: string) {
    return await this.db.todoListSettings.create({
      data: { organizationId },
    });
  }

  async updateTodoListSettings(
    organizationId: string,
    data: Partial<
      Omit<
        TodoListSettings,
        "organizationId" | "id" | "createdAt" | "updatedAt"
      >
    >
  ) {
    return await this.db.todoListSettings.update({
      where: {
        organizationId: organizationId,
      },
      data: data,
    });
  }

  async getTodoListSettings(organizationId: string) {
    return await this.db.todoListSettings.findUnique({
      where: {
        organizationId: organizationId,
      },
    });
  }

  async deleteTodoList(todoListId: string) {
    return await this.db.todoListSettings.delete({
      where: {
        id: todoListId,
      },
    });
  }

  async listTodoListSettingsWithPrivateSellerSettingsEnabled() {
    return await this.db.todoListSettings.findMany({
      where: {
        privateSellerSalesBalanceUpperThreshold: {
          not: null,
        },
      },
      select: {
        organizationId: true,
        privateSellerSalesBalanceUpperThreshold: true,
      },
    });
  }

  private async completeTodoListEvent(todoListId: string) {
    await this.db.todoList.update({
      where: {
        id: todoListId,
      },
      data: {
        status: TodoListStatus.DONE,
      },
    });
  }

  private async getCompanyCashBalanceBelowThresholdMeta(
    organizationId: string,
    thresholdBalance: number
  ) {
    const organization = await this.db.organization.findUnique({
      where: {
        id: organizationId,
      },
    });
    return {
      currentBalance: organization?.wallet || 0,
      thresholdBalance,
    };
  }

  private async createCompanyCashBalanceBelowThresholdEvent(
    organizationId: string,
    thresholdBalance: number
  ) {
    await this.db.todoList.create({
      data: {
        organizationId,
        event: TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD,
        priority: 1,
        meta: await this.getCompanyCashBalanceBelowThresholdMeta(
          organizationId,
          thresholdBalance
        ),
      },
    });
  }

  private async isEventCreationAllowedForCompanyCashBalanceThresholdEvent(
    organizationId: string
  ) {
    const organization = await this.db.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        wallet: true,
      },
    });

    const settings = await this.db.todoListSettings.findUnique({
      where: {
        organizationId,
      },
    });

    if (!settings || !organization)
      return {
        isThresholdCrossed: false,
        thresholdBalance: 0,
      };

    if (settings.companyCashBalanceLowerThreshold === null) {
      return {
        isThresholdCrossed: false,
        thresholdBalance: 0,
      };
    }
    return {
      isThresholdCrossed:
        organization?.wallet < settings?.companyCashBalanceLowerThreshold,
      thresholdBalance: settings?.companyCashBalanceLowerThreshold || 0,
    };
  }

  private async handleCompanyCashBalanceBelowThresholdEvent(
    organizationId: string
  ) {
    const { isThresholdCrossed, thresholdBalance } =
      await this.isEventCreationAllowedForCompanyCashBalanceThresholdEvent(
        organizationId
      );
    if (isThresholdCrossed) {
      await this.createCompanyCashBalanceBelowThresholdEvent(
        organizationId,
        thresholdBalance
      );
    }
  }

  private async getIndividualCashBalanceBelowThresholdMeta(
    userId: string,
    thresholdBalance: number
  ) {
    const user = await this.db.user.findUnique({
      where: {
        id: userId,
      },
    });
    return {
      currentBalance: user?.wallet || 0,
      userId,
      thresholdBalance,
    };
  }

  private async createIndividualCashBalanceBelowThresholdEvent(
    userId: string,
    organizationId: string,
    thresholdBalance: number
  ) {
    await this.db.todoList.create({
      data: {
        priority: 2,
        organizationId,
        event: TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD,
        meta: await this.getIndividualCashBalanceBelowThresholdMeta(
          userId,
          thresholdBalance
        ),
      },
    });
  }

  private async isEventCreationAllowedForIndividualCashBalanceThresholdEvent(
    userId: string
  ) {
    const user = await this.db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        organizationId: true,
        wallet: true,
      },
    });

    const settings = await this.db.todoListSettings.findUnique({
      where: {
        organizationId: user?.organizationId,
      },
    });

    const payload = {
      isWalletBalanceBelowThreshold: false,
      isWalletBalanceAboveThreshold: false,
      userWalletBalance: 0,
      thresholdBalance: 0,
    };

    if (!settings || !user) return payload;

    if (settings.individualCashBalanceLowerThreshold !== null) {
      payload.isWalletBalanceBelowThreshold =
        user?.wallet < settings?.individualCashBalanceLowerThreshold;
      payload.thresholdBalance = settings?.individualCashBalanceLowerThreshold;
    }

    return payload;
  }

  private async handleIndividualCashBalanceBelowThresholdEvent(
    userId: string,
    organizationId: string
  ) {
    const { isWalletBalanceBelowThreshold, thresholdBalance } =
      await this.isEventCreationAllowedForIndividualCashBalanceThresholdEvent(
        userId
      );
    if (isWalletBalanceBelowThreshold) {
      await this.createIndividualCashBalanceBelowThresholdEvent(
        userId,
        organizationId,
        thresholdBalance
      );
    }
  }

  private async getOrderPickupMeta(pickUpOrderId: string) {
    return {
      pickUpOrderId,
    };
  }

  private async handleCreateOrderPickupEvent(
    organizationId: string,
    pickUpOrderId: string
  ) {
    await this.db.todoList.create({
      data: {
        priority: 4,
        organizationId,
        event: TodoListEvent.ORDER_PICKUP_INITIATED,
        meta: await this.getOrderPickupMeta(pickUpOrderId),
      },
    });
  }

  private async getPurchaseWithBankTransferEventMeta(purchaseId: string) {
    return {
      purchaseId,
    };
  }

  private async updatePaymentDate(purchaseId: string, paymentDate: string) {
    return await this.db.purchase.update({
      where: {
        id: purchaseId,
      },
      data: {
        transactionDate: paymentDate,
        status: OrderStatus.PAID,
      },
    });
  }

  private async createPurchaseWithBankTransferEvent(
    organizationId: string,
    purchaseId: string
  ) {
    try {
      await this.db.todoList.create({
        data: {
          priority: 0,
          organizationId,
          event: TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
          meta: await this.getPurchaseWithBankTransferEventMeta(purchaseId),
        },
      });
    } catch (error) {
      console.log("🚀 ~ PurchaseWithBankTransferHandler ~ error:", error);
    }
  }

  private async handleCreatePurchaseWithBankTransferEvent(
    organizationId: string,
    purchaseId: string
  ) {
    this.createPurchaseWithBankTransferEvent(organizationId, purchaseId);
  }

  private async getPrivateSellerMeta(
    sellerId: string,
    totalSales: number,
    totalQuantity: number
  ) {
    return {
      sellerId,
      totalSales,
      totalQuantity,
    };
  }

  private async handleCreatePrivateSellerUpperThresholdEvent(
    organizationId: string,
    sellerId: string,
    totalSales: number,
    totalQuantity: number
  ) {
    return await this.db.todoList.create({
      data: {
        priority: 3,
        organizationId,
        event: TodoListEvent.PRIVATE_SELLER_SALES_ABOVE_THRESHOLD,
        meta: await this.getPrivateSellerMeta(
          sellerId,
          totalSales,
          totalQuantity
        ),
      },
    });
  }
}

export default TodoListRepository;
