import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreatePickupDelivery,
  GetPickupDeliveryFilterInterface,
} from "@/interfaces/pickup-delivery";

import {
  PickUpDelivery,
  ProductForDelivery,
  Seller,
  TodoListEvent,
  User,
} from "@prisma/client";

class PickupDeliveryService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async createPickupDelivery(data: CreatePickupDelivery): Promise<{
    pickUpDelivery: PickUpDelivery;
    productsForDelivery: ProductForDelivery[];
  } | null> {
    return PrismaService.getInstance().$transaction(
      async (tx) => {
        const factory = new RepositoryFactory(tx);
        const pickupDeliveryRepo = factory.getPickUpDeliveryRepository();
        const productsPickupDeliveryRepo =
          factory.getProductsPickupRepository();
        const todoListRepo = factory.getTodoListRepository();
        const pickUpDelivery = await pickupDeliveryRepo.createPickupDelivery({
          organizationId: data.organizationId,
          userId: data.userId,
          sellerId: data.sellerId,
          PONumber: data.PONumber,
          comment: data.comment,
        });

        const products = data.productsForDelivery.map((product) => ({
          ...product,
          pickUpDeliveryId: pickUpDelivery.id,
        }));

        const products_for_delivery =
          await productsPickupDeliveryRepo.bulkInsertProductsPurchased(
            products
          );

        todoListRepo.registerEvent(TodoListEvent.ORDER_PICKUP_INITIATED, {
          organizationId: pickUpDelivery.organizationId,
          pickUpOrderId: pickUpDelivery.id,
        });

        return {
          pickUpDelivery,
          productsForDelivery: products_for_delivery,
        };
      },
      { maxWait: 30000, timeout: 30000 }
    );
  }

  async getPickupDelivery(id: string): Promise<PickUpDelivery | null> {
    return this.repositoryFactory
      .getPickUpDeliveryRepository()
      .getPickupDelivery(id);
  }

  async getPickupDeliveryList(
    filters: GetPickupDeliveryFilterInterface,
    sortBy: "PONumber" | "createdAt" = "createdAt", // ✅ Fix here
    sortOrder: "asc" | "desc" = "desc",
    page: number = 1,
    limit: number = 10
  ): Promise<{
    pickupDeliveries: (PickUpDelivery & {
      user?: User | null;
      seller?: Seller | null;
    })[];
    total: number;
    totalPages: number;
  }> {
    return this.repositoryFactory
      .getPickUpDeliveryRepository()
      .getPickupDeliveryList(filters, sortBy, sortOrder, page, limit);
  }

  async getReceiptById(
    id: string,
    organizationId: string
  ): Promise<(PickUpDelivery & { user: User; seller: Seller }) | null> {
    return this.repositoryFactory
      .getPickUpDeliveryRepository()
      .getReceiptByID(id, organizationId);
  }
}

export default PickupDeliveryService;
