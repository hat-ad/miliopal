import {
  CreatePickupDelivery,
  GetPickupDeliveryFilterInterface,
} from "@/interfaces/pickup-delivery";

import PickupDeliveryRepository from "@/repository/pickup-delivery.repository";
import { PickUpDelivery, Seller, User } from "@prisma/client";

class PickupDeliveryService {
  static async createPickupDelivery(
    data: CreatePickupDelivery
  ): Promise<PickUpDelivery | null> {
    return PickupDeliveryRepository.createPickupDelivery(data);
  }

  static async getPickupDelivery(id: string): Promise<PickUpDelivery | null> {
    return PickupDeliveryRepository.getPickupDelivery(id);
  }

  static async getPickupDeliveryList(
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
    return PickupDeliveryRepository.getPickupDeliveryList(
      filters,
      sortBy,
      sortOrder,
      page,
      limit
    );
  }

  static async getReceiptById(
    id: string,
    organizationId: string
  ): Promise<(PickUpDelivery & { user: User; seller: Seller }) | null> {
    return PickupDeliveryRepository.getReceiptByID(id, organizationId);
  }
}

export default PickupDeliveryService;
