import PrismaService from "@/db/prisma-service";
import AuthRepository from "@/repository/auth.repository";
import CashHistoryRepository from "@/repository/cash-history.repository";
import OrganizationRepository from "@/repository/organization.repository";
import PickupDeliveryRepository from "@/repository/pickup-delivery.repository";
import ProductRepository from "@/repository/product.repository";
import ProductsPickupRepository from "@/repository/products-pickup-delivery.repository";
import ProductsPurchasedRepository from "@/repository/products-purchased.repository";
import PurchaseRepository from "@/repository/purchase.repository";
import ReceiptRepository from "@/repository/receipt.repository";
import SellerRepository from "@/repository/seller.repository";
import TodoListRepository from "@/repository/todo-list.repository";
import UserRepository from "@/repository/user.repository";
import { Prisma, PrismaClient } from "@prisma/client";

export class RepositoryFactory {
  private db: PrismaClient | Prisma.TransactionClient;

  constructor(db?: Prisma.TransactionClient) {
    this.db = db ?? PrismaService.getInstance();
  }

  getAuthRepository(): AuthRepository {
    return new AuthRepository(this.db);
  }

  getOrganizationRepository(): OrganizationRepository {
    return new OrganizationRepository(this.db);
  }

  getPickUpDeliveryRepository(): PickupDeliveryRepository {
    return new PickupDeliveryRepository(this.db);
  }

  getProductRepository(): ProductRepository {
    return new ProductRepository(this.db);
  }

  getProductsPickupRepository(): ProductsPickupRepository {
    return new ProductsPickupRepository(this.db);
  }

  getProductsPurchasedRepository(): ProductsPurchasedRepository {
    return new ProductsPurchasedRepository(this.db);
  }

  getPurchaseRepository(): PurchaseRepository {
    return new PurchaseRepository(this.db);
  }

  getReceiptRepository(): ReceiptRepository {
    return new ReceiptRepository(this.db);
  }

  getSellerRepository(): SellerRepository {
    return new SellerRepository(this.db);
  }

  getTodoListRepository(): TodoListRepository {
    return new TodoListRepository(this.db);
  }

  getUserRepository(): UserRepository {
    return new UserRepository(this.db);
  }

  getCashHistoryRepository(): CashHistoryRepository {
    return new CashHistoryRepository(this.db);
  }
}
