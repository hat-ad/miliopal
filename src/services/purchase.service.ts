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
  PurchaseType,
  Seller,
  SellerType,
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
    try {
      return PrismaService.getInstance().$transaction(
        async (tx) => {
          const factory = new RepositoryFactory(tx);
          const receiptRepo = factory.getReceiptRepository();
          const purchaseRepo = factory.getPurchaseRepository();
          const productPurchasedRepo = factory.getProductsPurchasedRepository();
          const todoListRepo = factory.getTodoListRepository();
          const userRepo = factory.getUserRepository();
          const privateSellerPurchaseStatsRepo =
            factory.getPrivateSellerPurchaseStatsRepository();

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

          const totalQuantity = data.products
            .map(
              (product: { price: number; quantity: number }) => product.quantity
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

          const purchasedItem = await purchaseRepo.getPurchase(purchase.id, {
            include: {
              seller: true,
            },
          });

          if (
            purchasedItem?.paymentMethod === PaymentMethod.BANK_TRANSFER

            // && purchasedItem?.seller?.type === SellerType.PRIVATE
          ) {
            await todoListRepo.registerEvent(
              TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
              { organizationId: data.organizationId, purchaseId: purchase.id }
            );
          }

          if (purchasedItem?.seller?.type === SellerType.PRIVATE) {
            const privateSellerPurchaseStats =
              await privateSellerPurchaseStatsRepo.getPrivateSellerPurchaseStatsBySellerId(
                purchasedItem.sellerId
              );

            if (!privateSellerPurchaseStats) {
              throw new Error("No purchase stats found for private seller");
            }
            const newTotalAmount =
              privateSellerPurchaseStats.totalSales + totalAmount;
            const newTotalQuantity =
              privateSellerPurchaseStats.totalQuantity + totalQuantity;

            await privateSellerPurchaseStatsRepo.updatePrivateSellerPurchaseStats(
              purchasedItem.sellerId,
              { totalSales: newTotalAmount, totalQuantity: newTotalQuantity }
            );
          }

          return { purchase: purchasedItem };
        },
        { maxWait: 30000, timeout: 30000 }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
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
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const purchaseRepo = factory.getPurchaseRepository();
        const productPurchasedRepo = factory.getProductsPurchasedRepository();
        const userRepo = factory.getUserRepository();
        const privateSellerPurchaseStatsRepo =
          factory.getPrivateSellerPurchaseStatsRepository();

        const purchase = await purchaseRepo.getPurchase(purchaseId);
        if (!purchase) return null;

        if (purchase.creditOrderId) {
          throw new Error("Amount already Credited!");
        }
        const productsPurchased =
          await productPurchasedRepo.getPurchasedProductByPurchaseId(
            purchaseId
          );

        const newOrderNo = `CD-${purchase.orderNo.split("-")[1]}`;

        const totalQuantity = productsPurchased
          .map((product) => product.quantity)
          .reduce((sum: number, value: number) => sum + value, 0);

        const newPurchase = await purchaseRepo.createPurchase({
          userId: purchase.userId,
          sellerId: purchase.sellerId,
          organizationId: purchase.organizationId,
          orderNo: newOrderNo,
          paymentMethod: purchase.paymentMethod,
          bankAccountNumber: purchase.bankAccountNumber,
          status: purchase.status,
          purchaseType: PurchaseType.CREDIT,
          totalAmount: -purchase.totalAmount,
          notes: creditNotes,
          comment: purchase.comment,
        });

        await purchaseRepo.updatePurchase(purchase.id, {
          creditOrderId: newPurchase.id,
        });

        if (
          purchase.paymentMethod === PaymentMethod.CASH &&
          purchase.status === OrderStatus.PAID
        ) {
          const user = await userRepo.getUser(purchase.userId);
          if (!user) throw new Error("User not found");
          const refundCreditAmount = user.wallet + purchase.totalAmount;
          await userRepo.updateUser(purchase.userId, {
            wallet: refundCreditAmount,
          });
        }

        const products = productsPurchased.map((item) => ({
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
          purchaseId: newPurchase.id,
        }));

        await productPurchasedRepo.bulkInsertProductsPurchased(products);

        const purchasedItem = await purchaseRepo.getPurchase(purchase.id, {
          include: {
            seller: true,
          },
        });

        if (purchasedItem?.seller?.type === SellerType.PRIVATE) {
          const privateSellerPurchaseStats =
            await privateSellerPurchaseStatsRepo.getPrivateSellerPurchaseStatsBySellerId(
              purchasedItem.sellerId
            );

          if (!privateSellerPurchaseStats) {
            throw new Error("No purchase stats found for private seller");
          }
          const newTotalAmount =
            privateSellerPurchaseStats.totalSales - purchase.totalAmount;
          const newTotalQuantity =
            privateSellerPurchaseStats.totalQuantity - totalQuantity;

          await privateSellerPurchaseStatsRepo.updatePrivateSellerPurchaseStats(
            purchasedItem.sellerId,
            { totalSales: newTotalAmount, totalQuantity: newTotalQuantity }
          );
        }

        return newPurchase;
      },
      { maxWait: 30000, timeout: 30000 }
    );
  }

  async getMonthlyPurchaseStats(
    filters: GetMonthlyPurchaseFilterInterface
  ): Promise<
    {
      year: string;
      month: string;
      unit: number | null;
      expense: number | null;
    }[]
  > {
    try {
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

      const productsPurchased = await this.repositoryFactory
        .getProductsPurchasedRepository()
        .getPurchasesByProductId({ productId: filters.productId, purchaseIds });

      if (!productsPurchased.length) {
        return [];
      }

      // Find the first and last purchase dates
      const purchaseDates = productsPurchased.map((p) => new Date(p.createdAt));
      const firstPurchaseDate = new Date(
        Math.min(...purchaseDates.map((d) => d.getTime()))
      );
      const lastPurchaseDate = new Date(
        Math.max(...purchaseDates.map((d) => d.getTime()))
      );

      // Extend the date range to at least 12 months
      const minEndDate = new Date(firstPurchaseDate);
      minEndDate.setMonth(minEndDate.getMonth() + 11);
      if (lastPurchaseDate < minEndDate) {
        lastPurchaseDate.setMonth(firstPurchaseDate.getMonth() + 11);
      }

      // Group data by month & year
      const groupedData: Record<string, { unit: number; expense: number }> = {};
      productsPurchased.forEach((product) => {
        const date = new Date(product.createdAt);
        const year = date.getFullYear().toString();
        const month = MonthNames[date.getMonth()];
        const key = `${year}-${month}`;

        if (!groupedData[key]) {
          groupedData[key] = { unit: 0, expense: 0 };
        }

        groupedData[key].unit += product.quantity;
        groupedData[key].expense += product.price * product.quantity;
      });

      // Generate statistics from first purchase date to at least 12 months later
      const allStats: {
        year: string;
        month: string;
        unit: number | null;
        expense: number | null;
      }[] = [];
      let currentDate = new Date(firstPurchaseDate);
      currentDate.setDate(1); // ✅ Set the day to the 1st to avoid month skipping issues

      while (currentDate <= lastPurchaseDate) {
        const year = currentDate.getFullYear().toString();
        const month = MonthNames[currentDate.getMonth()];
        const key = `${year}-${month}`;

        allStats.push({
          year,
          month,
          unit: groupedData[key]?.unit ?? null, // Use `null` if no data exists
          expense: groupedData[key]?.expense ?? null, // Use `null` if no data exists
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1); // ✅ Set back to the 1st to avoid leap year issues
      }

      return allStats;
    } catch (error) {
      throw new Error(getError(error));
    }
  }

  async getBuyerPurchaseStats(
    id: string,
    organizationId: string
  ): Promise<{
    units: number;
    expense: number;
  }> {
    const purchaseIds = await this.repositoryFactory
      .getPurchaseRepository()
      .getPurchaseIds({ userId: id, organizationId });

    return this.repositoryFactory
      .getProductsPurchasedRepository()
      .getProductsPurchaseStatsByPurchaseIds(purchaseIds);
  }

  async getSellerPurchaseStats(
    id: string,
    organizationId: string
  ): Promise<{
    units: number;
    expense: number;
  }> {
    const purchaseIds = await this.repositoryFactory
      .getPurchaseRepository()
      .getPurchaseIds({ sellerId: id, organizationId });

    return this.repositoryFactory
      .getProductsPurchasedRepository()
      .getProductsPurchaseStatsByPurchaseIds(purchaseIds);
  }
}

export default PurchaseService;
