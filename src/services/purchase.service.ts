import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreatePurchaseInterface,
  GetMonthlyPurchaseFilterInterface,
  GetPurchaseFilterInterface,
} from "@/interfaces/purchase";
import { MonthNames } from "@/types/common";
import { getError } from "@/utils/common";
import {
  OrderStatus,
  PaymentMethod,
  Purchase,
  Seller,
  TodoListEvent,
  User,
} from "@prisma/client";

class PurchaseService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async createPurchase(data: CreatePurchaseInterface): Promise<{
    purchase:
      | (Purchase & { user?: User | null; seller?: Seller | null })
      | null;
  } | null> {
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const receiptRepo = factory.getReceiptRepository();
        const purchaseRepo = factory.getPurchaseRepository();
        const productPurchasedRepo = factory.getProductsPurchasedRepository();
        const todoListRepo = factory.getTodoListRepository();
        const userRepo = factory.getUserRepository();

        const receipt = await receiptRepo.getReceiptByOrganizationId(
          data.organizationId
        );

        if (!receipt?.startingOrderNumber || !receipt?.currentOrderNumber) {
          throw new Error(
            "Starting order number / Current order number is missing. Please set before purchasing."
          );
        }

        const totalAmount = data.products
          .map(
            (product: { price: number; quantity: number }) =>
              product.price * product.quantity
          )
          .reduce((sum: number, value: number) => sum + value, 0);

        let orderNo = "";

        // it means the order hasnt' been initiated
        if (receipt.currentOrderNumber === -1) {
          orderNo = `ORD-${receipt.startingOrderNumber}`;
          await receiptRepo.updateReceiptInternal(receipt.id, {
            currentOrderNumber: receipt.startingOrderNumber,
          });
        } else {
          orderNo = `ORD-${receipt.currentOrderNumber + 1}`;
          await receiptRepo.updateReceiptInternal(receipt.id, {
            currentOrderNumber: receipt.currentOrderNumber + 1,
          });
        }

        data.orderNo = orderNo;
        data.totalAmount = totalAmount;

        const payload: CreatePurchaseInterface & {
          transactionDate: Date | null;
        } = { ...data, transactionDate: null };
        if (
          data.paymentMethod === PaymentMethod.CASH &&
          data.status === OrderStatus.PAID
        ) {
          payload.transactionDate = new Date();
          const user = await userRepo.getUser(data.userId);
          if (!user) throw new Error("User not found");
          const newWalletAmount = user.wallet - totalAmount;
          await userRepo.updateUser(data.userId, {
            wallet: newWalletAmount,
          });
        }

        const purchase = await purchaseRepo.createPurchase(payload);

        const productsData = data.products.map((product) => ({
          ...product,
          purchaseId: purchase.id,
        }));

        await productPurchasedRepo.bulkInsertProductsPurchased(productsData);

        await todoListRepo.registerEvent(
          TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD,
          { organizationId: data.organizationId, userId: data.userId }
        );
        await todoListRepo.registerEvent(
          TodoListEvent.INDIVIDUAL_CASH_BALANCE_ABOVE_THRESHOLD,
          { organizationId: data.organizationId, userId: data.userId }
        );

        const purchasedItem = await purchaseRepo.getPurchase(purchase.id);

        if (purchasedItem?.paymentMethod === PaymentMethod.BANK_TRANSFER) {
          await todoListRepo.registerEvent(
            TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
            { organizationId: data.organizationId, purchaseId: purchase.id }
          );
        }

        return { purchase: purchasedItem };
      },
      {
        timeout: 30000,
      }
    );
  }

  async getPurchase(id: string): Promise<Purchase | null> {
    return this.repositoryFactory.getPurchaseRepository().getPurchase(id);
  }

  async getPurchaseList(
    filters: GetPurchaseFilterInterface,
    sortBy: "orderNo" | "createdAt" | "status" = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    page: number = 1,
    limit: number = 10
  ): Promise<{
    purchases: (Purchase & { user?: User | null; seller?: Seller | null })[];
    total: number;
    totalPages: number;
  }> {
    return this.repositoryFactory
      .getPurchaseRepository()
      .getPurchaseList(filters, sortBy, sortOrder, page, limit);
  }

  async getReceiptByOrderNo(
    orderNo: string,
    organizationId: string
  ): Promise<(Purchase & { user: User; seller: Seller }) | null> {
    return this.repositoryFactory
      .getPurchaseRepository()
      .getReceiptByOrderNo(orderNo, organizationId);
  }

  async creditPurchaseOrder(
    purchaseId: string,
    creditNotes: string
  ): Promise<Purchase | null> {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);
      const purchaseRepo = factory.getPurchaseRepository();
      const productPurchasedRepo = factory.getProductsPurchasedRepository();
      const purchase = await purchaseRepo.getPurchase(purchaseId);
      if (!purchase) return null;
      const productsPurchased =
        await productPurchasedRepo.getPurchasedProductByPurchaseId(purchaseId);

      const newOrderNo = `CD-${purchase.orderNo.split("-")[1]}`;

      const newPurchase = await purchaseRepo.createPurchase({
        userId: purchase.userId,
        sellerId: purchase.sellerId,
        organizationId: purchase.organizationId,
        orderNo: newOrderNo,
        paymentMethod: purchase.paymentMethod,
        bankAccountNumber: purchase.bankAccountNumber,
        status: purchase.status,
        totalAmount: -purchase.totalAmount,
        notes: creditNotes,
        comment: purchase.comment,
      });

      const products = productsPurchased.map((item) => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
        purchaseId: newPurchase.id,
      }));

      await productPurchasedRepo.bulkInsertProductsPurchased(products);

      return newPurchase;
    });
  }

  async getMonthlyPurchaseStats(
    filters: GetMonthlyPurchaseFilterInterface
  ): Promise<{ year: string; month: string; unit: number; expense: number }[]> {
    try {
      // Get purchase IDs
      const purchaseIds = await this.repositoryFactory
        .getPurchaseRepository()
        .getPurchaseIds({
          userId: filters.userId,
          sellerId: filters.sellerId,
          organizationId: filters.organizationId,
        });

      if (!purchaseIds.length) {
        return [];
      }

      //Fetch purchased products
      const productsPurchased = await this.repositoryFactory
        .getProductsPurchasedRepository()
        .getPurchasesByProductId({ productId: filters.productId, purchaseIds });

      //Group data by month & year
      const groupedData: Record<string, { unit: number; expense: number }> = {};

      productsPurchased.forEach((product) => {
        const date = new Date(product.createdAt);
        const year = date.getFullYear().toString();
        const monthIndex = date.getMonth();
        const month = MonthNames[monthIndex];

        const key = `${year}-${month}`;

        if (!groupedData[key]) {
          groupedData[key] = { unit: 0, expense: 0 };
        }

        groupedData[key].unit += product.quantity;
        groupedData[key].expense += product.price * product.quantity;
      });

      // Step 4: Fill missing between the earliest and latest
      const allStats: {
        year: string;
        month: string;
        unit: number;
        expense: number;
      }[] = [];

      const allKeys = Object.keys(groupedData);
      if (allKeys.length > 0) {
        const sortedKeys = allKeys.sort();
        const [startYear, startMonth] = sortedKeys[0].split("-");
        const [endYear, endMonth] =
          sortedKeys[sortedKeys.length - 1].split("-");

        let startDate = new Date(
          parseInt(startYear),
          MonthNames.indexOf(startMonth)
        );
        let endDate = new Date(parseInt(endYear), MonthNames.indexOf(endMonth));

        while (startDate <= endDate) {
          const year = startDate.getFullYear().toString();
          const month = MonthNames[startDate.getMonth()];
          const key = `${year}-${month}`;

          allStats.push({
            year,
            month,
            unit: groupedData[key]?.unit || 0,
            expense: groupedData[key]?.expense || 0,
          });

          startDate.setMonth(startDate.getMonth() + 1);
        }
      }

      return allStats;
    } catch (error) {
      throw new Error(getError(error));
    }
  }

  async getBuyerPurchaseStats(id: string): Promise<{
    units: number;
    expense: number;
  }> {
    const purchaseIds = await this.repositoryFactory
      .getPurchaseRepository()
      .getPurchaseIds({ userId: id });

    return this.repositoryFactory
      .getProductsPurchasedRepository()
      .getProductsPurchaseStatsByPurchaseIds(purchaseIds);
  }

  async getSellerPurchaseStats(id: string): Promise<{
    units: number;
    expense: number;
  }> {
    const purchaseIds = await this.repositoryFactory
      .getPurchaseRepository()
      .getPurchaseIds({ sellerId: id });

    return this.repositoryFactory
      .getProductsPurchasedRepository()
      .getProductsPurchaseStatsByPurchaseIds(purchaseIds);
  }
}

export default PurchaseService;
