import {
  PaymentMethod,
  Prisma,
  PrismaClient,
  TodoListEvent,
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
    this.db.todoList.create({
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
    this.db.todoList.update({
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
    todoListId: string,
    organizationId: string
  ) {
    const { isThresholdCrossed } = await this.isEventCreationAllowed(
      organizationId
    );
    if (!isThresholdCrossed) {
      await this.completeCompanyCashBalanceBelowThresholdEvent(todoListId);
    }
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
  private async getIndividualCashBalanceAboveThresholdMeta(
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
    this.db.todoList.create({
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

  private async createIndividualCashBalanceAboveThresholdEvent(
    userId: string,
    organizationId: string,
    thresholdBalance: number
  ) {
    this.db.todoList.create({
      data: {
        organizationId,
        event: TodoListEvent.INDIVIDUAL_CASH_BALANCE_ABOVE_THRESHOLD,
        meta: await this.getIndividualCashBalanceAboveThresholdMeta(
          userId,
          thresholdBalance
        ),
      },
    });
  }

  private async completeIndividualCashBalanceThresholdEvent(
    todoListId: string
  ) {
    this.db.todoList.update({
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

    payload.isWalletBalanceAboveThreshold =
      user?.wallet >= settings?.individualCashBalanceUpperThreshold;
    payload.isWalletBalanceBelowThreshold =
      user?.wallet < settings?.individualCashBalanceLowerThreshold;
    payload.userWalletBalance = user?.wallet;
    payload.thresholdBalance = settings?.individualCashBalanceLowerThreshold;

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
  async handleIndividualCashBalanceAboveThresholdEvent(
    userId: string,
    organizationId: string
  ) {
    const { isWalletBalanceAboveThreshold, thresholdBalance } =
      await this.isEventCreationAllowed(userId);
    if (isWalletBalanceAboveThreshold) {
      await this.createIndividualCashBalanceAboveThresholdEvent(
        userId,
        organizationId,
        thresholdBalance
      );
    }
  }

  async handleIndividualCashBalanceBelowThresholdEventCompletion(
    todoListId: string,
    userId: string
  ) {
    const { isWalletBalanceBelowThreshold } = await this.isEventCreationAllowed(
      userId
    );
    if (!isWalletBalanceBelowThreshold) {
      await this.completeIndividualCashBalanceThresholdEvent(todoListId);
    }
  }

  async handleIndividualCashBalanceAboveThresholdEventCompletion(
    todoListId: string,
    userId: string
  ) {
    const { isWalletBalanceAboveThreshold } = await this.isEventCreationAllowed(
      userId
    );
    if (!isWalletBalanceAboveThreshold) {
      await this.completeIndividualCashBalanceThresholdEvent(todoListId);
    }
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
    this.db.todoList.create({
      data: {
        organizationId,
        event: TodoListEvent.ORDER_PICKUP_INITIATED,
        meta: await this.getOrderPickupMeta(pickUpOrderId),
      },
    });
  }

  private async completeOrderPickupEvent(todoListId: string) {
    this.db.todoList.update({
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

  private async isEventCreationAllowed(purchaseId: string) {
    const purchase = await this.db.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      select: {
        paymentMethod: true,
      },
    });

    if (!purchase) {
      return {
        isAllowed: false,
      };
    }

    return {
      isAllowed: purchase.paymentMethod === PaymentMethod.BANK_TRANSFER,
    };
  }

  private async updatePaymentDate(
    prisma: Prisma.TransactionClient,
    purchaseId: string,
    paymentDate: Date
  ) {
    return prisma.purchase.update({
      where: {
        id: purchaseId,
      },
      data: {
        bankTransferDate: paymentDate,
      },
    });
  }

  private async completePurchaseWithBankTransferEvent(
    prisma: Prisma.TransactionClient,
    todoListId: string
  ) {
    return prisma.todoList.update({
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
    this.db.todoList.create({
      data: {
        organizationId,
        event: TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
        meta: await this.getPurchaseWithBankTransferEventMeta(purchaseId),
      },
    });
  }

  async handleCreatePurchaseWithBankTransferEvent(
    organizationId: string,
    purchaseId: string
  ) {
    const { isAllowed } = await this.isEventCreationAllowed(purchaseId);
    if (isAllowed) {
      this.createPurchaseWithBankTransferEvent(organizationId, purchaseId);
    }
  }

  async handleCompletePurchaseWithBankTransferEvent(
    todoListId: string,
    purchaseId: string,
    paymentDate: Date
  ) {
    if (this.db instanceof PrismaClient) {
      await this.db.$transaction(async (prisma) => {
        await this.updatePaymentDate(prisma, purchaseId, paymentDate);
        await this.completePurchaseWithBankTransferEvent(prisma, todoListId);
      });
    }
  }
}

class TodoListRepository extends BaseRepository {
  registerEvent(
    event: TodoListEvent,
    payload: {
      userId?: string;
      organizationId: string;
      pickUpOrderId?: string;
      purchaseId?: string;
    }
  ) {
    switch (event) {
      case TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD:
        const eventHandlerCompany = new CompanyCashBalanceEventsHandler(
          this.db
        );
        eventHandlerCompany.handleCompanyCashBalanceBelowThresholdEvent(
          payload.organizationId
        );
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD:
        const eventHandlerIndividual1 = new IndividualCashBalanceEventsHandler(
          this.db
        );
        eventHandlerIndividual1.handleIndividualCashBalanceBelowThresholdEvent(
          payload.userId || "",
          payload.organizationId
        );
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_ABOVE_THRESHOLD:
        const eventHandlerIndividual2 = new IndividualCashBalanceEventsHandler(
          this.db
        );
        eventHandlerIndividual2.handleIndividualCashBalanceAboveThresholdEvent(
          payload.userId || "",
          payload.organizationId
        );
        break;
      case TodoListEvent.ORDER_PICKUP_INITIATED:
        const orderPickupHandler = new OrderPickUpEventsHandler(this.db);
        orderPickupHandler.handleCreateOrderPickupEvent(
          payload.organizationId,
          payload.pickUpOrderId || ""
        );
        break;
      case TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER:
        const purchaseWithBankTransferHandler =
          new PurchaseWithBankTransferHandler(this.db);
        purchaseWithBankTransferHandler.handleCreatePurchaseWithBankTransferEvent(
          payload.organizationId,
          payload.purchaseId || ""
        );
        break;
      default:
        break;
    }
  }

  completeEvent(
    event: TodoListEvent,
    payload: {
      userId?: string;
      todoListId: string;
      organizationId?: string;
      paymentDate?: Date;
      purchaseId?: string;
    }
  ) {
    switch (event) {
      case TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD:
        const eventHandler = new CompanyCashBalanceEventsHandler(this.db);
        eventHandler.handleCompanyCashBalanceBelowThresholdEventCompletion(
          payload.todoListId,
          payload.organizationId || ""
        );
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD:
        const eventHandlerIndividual1 = new IndividualCashBalanceEventsHandler(
          this.db
        );
        eventHandlerIndividual1.handleIndividualCashBalanceBelowThresholdEventCompletion(
          payload.todoListId,
          payload.userId || ""
        );
        break;

      case TodoListEvent.INDIVIDUAL_CASH_BALANCE_ABOVE_THRESHOLD:
        const eventHandlerIndividual2 = new IndividualCashBalanceEventsHandler(
          this.db
        );
        eventHandlerIndividual2.handleIndividualCashBalanceAboveThresholdEventCompletion(
          payload.todoListId,
          payload.userId || ""
        );
        break;
      case TodoListEvent.ORDER_PICKUP_INITIATED:
        const orderPickupHandler = new OrderPickUpEventsHandler(this.db);
        orderPickupHandler.handleCompleteOrderPickupEvent(payload.todoListId);
        break;
      case TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER:
        if (!payload.paymentDate || !payload.purchaseId) return;
        const purchaseWithBankTransferHandler =
          new PurchaseWithBankTransferHandler(this.db);
        purchaseWithBankTransferHandler.handleCompletePurchaseWithBankTransferEvent(
          payload.todoListId,
          payload.purchaseId,
          payload.paymentDate
        );
        break;
      default:
        break;
    }
  }

  listTodoLists(organizationId: string) {
    return this.db.todoList.findMany({
      where: {
        organizationId,
      },
    });
  }
}

export default TodoListRepository;
