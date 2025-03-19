import AuthService from "@/services/auth.service";
import OrganizationService from "@/services/organization.service";
import PickupDeliveryService from "@/services/pickup-delivery.service";
import ProductService from "@/services/product.service";
import PurchaseService from "@/services/purchase.service";
import ReceiptService from "@/services/receipt.service";
import SellerService from "@/services/seller.service";
// import TodoListService from "@/services/todo-list.service";
import UserService from "@/services/user.service";

export class ServiceFactory {
  constructor() {}
  getAuthService(): AuthService {
    return new AuthService();
  }

  getOrganizationService(): OrganizationService {
    return new OrganizationService();
  }

  getPickUpDeliveryService(): PickupDeliveryService {
    return new PickupDeliveryService();
  }

  getProductService(): ProductService {
    return new ProductService();
  }

  getPurchaseService(): PurchaseService {
    return new PurchaseService();
  }

  getReceiptService(): ReceiptService {
    return new ReceiptService();
  }

  getSellerService(): SellerService {
    return new SellerService();
  }

  //   getTodoListService(): TodoListService {
  //     return new TodoListService();
  //   }

  getUserService(): UserService {
    return new UserService();
  }
}

export class ServiceFactorySingleton {
  private static instance: ServiceFactory;
  private constructor() {}
  public static getInstance(): ServiceFactory {
    if (!ServiceFactorySingleton.instance) {
      ServiceFactorySingleton.instance = new ServiceFactory();
    }
    return ServiceFactorySingleton.instance;
  }
}
