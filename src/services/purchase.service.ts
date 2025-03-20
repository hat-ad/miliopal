import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreatePurchaseInterface,
  GetPurchaseFilterInterface,
} from "@/interfaces/purchase";
import { ProductsPurchased, Purchase, Seller, User } from "@prisma/client";

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
      const orderNo = `ORD-${receipt.currentOrderNumber + 1}`;

      data.orderNo = orderNo;
      data.totalAmount = totalAmount;

      const purchase = await purchaseRepo.createPurchase(data);

      const productsData = data.products.map((product) => ({
        ...product,
        purchaseId: purchase.id,
      }));

      const products = await productPurchasedRepo.bulkInsertProductsPurchased(
        productsData
      );

      // todoListRepo.registerEvent(
      //   TodoListEvent.PURCHASE_INITIATED_WITH_BANK_TRANSFER,
      //   { organizationId: data.organizationId, purchaseId: purchase.id }
      // );

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
      orderNo: purchase.orderNo,
      paymentMethod: purchase.paymentMethod,
      bankAccountNumber: purchase.bankAccountNumber,
      status: purchase.status,
      totalAmount: -purchase.totalAmount,
      notes: creditNotes,
      comment: purchase.comment,
    });
  }
}

export default PurchaseService;
