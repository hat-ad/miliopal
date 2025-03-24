import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreatePurchaseInterface,
  GetMonthlyPurchaseFilterInterface,
  GetPurchaseFilterInterface,
} from "@/interfaces/purchase";
import { MonthNames } from "@/types/common";
import {
  OrderStatus,
  PaymentMethod,
  ProductsPurchased,
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
    purchase: Purchase;
    poducts_purchased: ProductsPurchased[];
  } | null> {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);
      const receiptRepo = factory.getReceiptRepository();
      const purchaseRepo = factory.getPurchaseRepository();
      const todoListRepo = factory.getTodoListRepository();
      const productPurchasedRepo = factory.getProductsPurchasedRepository();

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
      }

      const purchase = await purchaseRepo.createPurchase(payload);

      const productsData = data.products.map((product) => ({
        ...product,
        purchaseId: purchase.id,
      }));

      const products = await productPurchasedRepo.bulkInsertProductsPurchased(
        productsData
      );

      todoListRepo.registerEvent(
        TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
        { organizationId: data.organizationId, purchaseId: purchase.id }
      );
      todoListRepo.registerEvent(
        TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD,
        { organizationId: data.organizationId, userId: data.userId }
      );
      todoListRepo.registerEvent(
        TodoListEvent.INDIVIDUAL_CASH_BALANCE_ABOVE_THRESHOLD,
        { organizationId: data.organizationId, userId: data.userId }
      );

      return { purchase, poducts_purchased: products };
    });
  }

  async getPurchase(id: string): Promise<Purchase | null> {
    return this.repositoryFactory.getPurchaseRepository().getPurchase(id);
  }

  async getPurchaseList(
    filters: GetPurchaseFilterInterface,
    sortBy: "orderNo" | "createdAt" | "status" = "createdAt", // ✅ Fix here
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
    const purchase = await this.getPurchase(purchaseId);
    if (!purchase) return null;

    const newOrderNo = `CD-${purchase.orderNo.split("-")[1]}`;

    return this.repositoryFactory.getPurchaseRepository().createPurchase({
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
  }

  async getMonthlyPurchaseStats(
    filters: GetMonthlyPurchaseFilterInterface,
    sortBy: "createdAt" | "status" = "createdAt",
    sortOrder: "asc" | "desc" = "asc",
    page: number = 1,
    limit: number = 10
  ): Promise<{
    stats: { year: string; month: string; unit: number; expence: number }[];
    total: number;
    totalPages: number;
  }> {
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
        throw new Error("No purchase IDs found!");
      }

      // Fetch products purchased for each purchase ID
      const productsPurchased = await this.repositoryFactory
        .getProductsPurchasedRepository()
        .getPurchasesByProductId({ productId: filters.productId, purchaseIds });

      //grouped data monthwise
      const groupedData: Record<
        string,
        { unit: number; expence: number; monthIndex: number }
      > = {};

      productsPurchased.forEach((product) => {
        const date = new Date(product.createdAt);
        const year = date.getFullYear().toString();
        const monthIndex = date.getMonth();
        const month = MonthNames[monthIndex];

        const key = `${year}-${month}`;

        if (!groupedData[key]) {
          groupedData[key] = { unit: 0, expence: 0, monthIndex };
        }

        groupedData[key].unit += product.quantity;
        groupedData[key].expence += product.price * product.quantity;
      });

      const purchases = Object.entries(groupedData)
        .map(([key, value]) => {
          const [year, month] = key.split("-");
          return {
            year,
            month,
            unit: value.unit,
            expence: value.expence,
            monthIndex: value.monthIndex,
          };
        })
        .sort((a, b) => {
          return a.year === b.year
            ? a.monthIndex - b.monthIndex
            : parseInt(a.year) - parseInt(b.year);
        })
        .map(({ monthIndex, ...rest }) => rest);

      const total = purchases.length;
      const totalPages = Math.ceil(total / limit);

      return { stats: purchases, total, totalPages };
    } catch (error) {
      throw new Error("Failed to fetch purchase stats");
    }
  }
}

export default PurchaseService;
