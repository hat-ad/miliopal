import { bindMethods } from "@/functions/function";
import {
  Prisma,
  PrismaClient,
  TodoListEvent,
  TodoListSettings,
  TodoListStatus,
} from "@prisma/client";
import BaseRepository from "./base.repository";
type PrismaTransactionClient = PrismaClient | Prisma.TransactionClient;
class CompanyCashBalanceEventsHandler {
  db: PrismaTransactionClient;
  constructor(db: PrismaTransactionClient) {
    this.db = db;
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
        meta: await this.getCompanyCashBalanceBelowThresholdMeta(
          organizationId,
          thresholdBalance
        ),
      },
    });
  }

  private async completeCompanyCashBalanceBelowThresholdEvent(
    todoListId: string
  ) {
    await this.db.todoList.update({
      where: {
        id: todoListId,
      },
      data: {
        status: TodoListStatus.DONE,
      },
    });
  }

  private async isEventCreationAllowed(organizationId: string) {
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

  async handleCompanyCashBalanceBelowThresholdEvent(organizationId: string) {
    const { isThresholdCrossed, thresholdBalance } =
      await this.isEventCreationAllowed(organizationId);
    if (isThresholdCrossed) {
      await this.createCompanyCashBalanceBelowThresholdEvent(
        organizationId,
        thresholdBalance
      );
    }
  }

  async handleCompanyCashBalanceBelowThresholdEventCompletion(
    todoListId: string
  ) {
    await this.completeCompanyCashBalanceBelowThresholdEvent(todoListId);
  }
}

class IndividualCashBalanceEventsHandler {
  db: PrismaTransactionClient;
  constructor(db: PrismaTransactionClient) {
    this.db = db;
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
        organizationId,
        event: TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD,
        meta: await this.getIndividualCashBalanceBelowThresholdMeta(
          userId,
          thresholdBalance
        ),
      },
    });
  }

  private async completeIndividualCashBalanceThresholdEvent(
    todoListId: string
  ) {
    await this.db.todoList.update({
      where: {
        id: todoListId,
      },
      data: {
        status: TodoListStatus.DONE,
      },
    });
  }

  private async isEventCreationAllowed(userId: string) {
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

  async handleIndividualCashBalanceBelowThresholdEvent(
    userId: string,
    organizationId: string
  ) {
    const { isWalletBalanceBelowThreshold, thresholdBalance } =
      await this.isEventCreationAllowed(userId);
    if (isWalletBalanceBelowThreshold) {
      await this.createIndividualCashBalanceBelowThresholdEvent(
        userId,
        organizationId,
        thresholdBalance
      );
    }
  }

  async handleIndividualCashBalanceBelowThresholdEventCompletion(
    todoListId: string
  ) {
    await this.completeIndividualCashBalanceThresholdEvent(todoListId);
  }
}

class OrderPickUpEventsHandler {
  db: PrismaTransactionClient;
  constructor(db: PrismaTransactionClient) {
    this.db = db;
  }

  private async getOrderPickupMeta(pickUpOrderId: string) {
    return {
      pickUpOrderId,
    };
  }

  async handleCreateOrderPickupEvent(
    organizationId: string,
    pickUpOrderId: string
  ) {
    await this.db.todoList.create({
      data: {
        organizationId,
        event: TodoListEvent.ORDER_PICKUP_INITIATED,
        meta: await this.getOrderPickupMeta(pickUpOrderId),
      },
    });
  }

  private async completeOrderPickupEvent(todoListId: string) {
    await this.db.todoList.update({
      where: {
        id: todoListId,
      },
      data: {
        status: TodoListStatus.DONE,
      },
    });
  }

  async handleCompleteOrderPickupEvent(todoListId: string) {
    await this.completeOrderPickupEvent(todoListId);
  }
}

class PurchaseWithBankTransferHandler {
  db: PrismaTransactionClient;
  constructor(db: PrismaTransactionClient) {
    this.db = db;
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
      },
    });
  }

  private async completePurchaseWithBankTransferEvent(todoListId: string) {
    return await this.db.todoList.update({
      where: {
        id: todoListId,
      },
      data: {
        status: TodoListStatus.DONE,
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
          organizationId,
          event: TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
          meta: await this.getPurchaseWithBankTransferEventMeta(purchaseId),
        },
      });
    } catch (error) {
      console.log("🚀 ~ PurchaseWithBankTransferHandler ~ error:", error);
    }
  }

  async handleCreatePurchaseWithBankTransferEvent(
    organizationId: string,
    purchaseId: string
  ) {
    this.createPurchaseWithBankTransferEvent(organizationId, purchaseId);
  }

  async handleCompletePurchaseWithBankTransferEvent(
    todoListId: string,
    purchaseId: string,
    paymentDate: string
  ) {
    await this.updatePaymentDate(purchaseId, paymentDate);
    await this.completePurchaseWithBankTransferEvent(todoListId);
  }
}

class PrivateSellerSalesEventsHandler {
  db: PrismaTransactionClient;
  constructor(db: PrismaTransactionClient) {
    this.db = db;
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

  async handleCreatePrivateSellerUpperThresholdEvent(
    organizationId: string,
    sellerId: string,
    totalSales: number,
    totalQuantity: number
  ) {
    await this.db.todoList.create({
      data: {
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

  private async completePrivateSellerUpperThresholdEvent(todoListId: string) {
    await this.db.todoList.update({
      where: {
        id: todoListId,
      },
      data: {
        status: TodoListStatus.DONE,
      },
    });
  }

  async handleCompletePrivateSellerUpperThresholdEvent(todoListId: string) {
    await this.completePrivateSellerUpperThresholdEvent(todoListId);
  }
}

class TodoListRepository extends BaseRepository {
  constructor(db: PrismaTransactionClient) {
    super(db);
    bindMethods(this);
  }
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
        const eventHandlerCompany = new CompanyCashBalanceEventsHandler(
          this.db
        );
        await eventHandlerCompany.handleCompanyCashBalanceBelowThresholdEvent(
          payload.organizationId
        );
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD:
        const eventHandlerIndividual1 = new IndividualCashBalanceEventsHandler(
          this.db
        );
        await eventHandlerIndividual1.handleIndividualCashBalanceBelowThresholdEvent(
          payload.userId || "",
          payload.organizationId
        );
        break;
      case TodoListEvent.ORDER_PICKUP_INITIATED:
        const orderPickupHandler = new OrderPickUpEventsHandler(this.db);
        await orderPickupHandler.handleCreateOrderPickupEvent(
          payload.organizationId,
          payload.pickUpOrderId || ""
        );
        break;
      case TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER:
        const purchaseWithBankTransferHandler =
          new PurchaseWithBankTransferHandler(this.db);
        await purchaseWithBankTransferHandler.handleCreatePurchaseWithBankTransferEvent(
          payload.organizationId,
          payload.purchaseId || ""
        );
        break;
      case TodoListEvent.PRIVATE_SELLER_SALES_ABOVE_THRESHOLD:
        const privateSellerSalesAboveThresholdHandler =
          new PrivateSellerSalesEventsHandler(this.db);
        await privateSellerSalesAboveThresholdHandler.handleCreatePrivateSellerUpperThresholdEvent(
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
        const eventHandler = new CompanyCashBalanceEventsHandler(this.db);
        await eventHandler.handleCompanyCashBalanceBelowThresholdEventCompletion(
          payload.todoListId
        );
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD:
        const eventHandlerIndividual1 = new IndividualCashBalanceEventsHandler(
          this.db
        );
        await eventHandlerIndividual1.handleIndividualCashBalanceBelowThresholdEventCompletion(
          payload.todoListId
        );
        break;
      case TodoListEvent.ORDER_PICKUP_INITIATED:
        const orderPickupHandler = new OrderPickUpEventsHandler(this.db);
        await orderPickupHandler.handleCompleteOrderPickupEvent(
          payload.todoListId
        );
        break;
      case TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER:
        if (!payload.paymentDate || !payload.purchaseId) {
          throw new Error("Payment date and purchase id are required");
        }
        const purchaseWithBankTransferHandler =
          new PurchaseWithBankTransferHandler(this.db);
        await purchaseWithBankTransferHandler.handleCompletePurchaseWithBankTransferEvent(
          payload.todoListId,
          payload.purchaseId,
          payload.paymentDate
        );
        break;
      case TodoListEvent.PRIVATE_SELLER_SALES_ABOVE_THRESHOLD:
        const privateSellerSalesAboveThresholdHandler =
          new PrivateSellerSalesEventsHandler(this.db);
        await privateSellerSalesAboveThresholdHandler.handleCompletePrivateSellerUpperThresholdEvent(
          payload.todoListId
        );
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
}

export default TodoListRepository;
