import {
  CreatePickupDelivery,
  GetPickupDeliveryFilterInterface,
} from "@/interfaces/pickup-delivery";

import { PickUpDelivery, Seller, User } from "@prisma/client";
import BaseRepository from "./base.repository";

class PickupDeliveryRepository extends BaseRepository {
  async createPickupDelivery(
    data: Omit<CreatePickupDelivery, "products">
  ): Promise<PickUpDelivery> {
    return this.db.pickUpDelivery.create({
      data: data,
    });
  }

  async getPickupDelivery(id: string): Promise<PickUpDelivery | null> {
    return this.db.pickUpDelivery.findUnique({
      where: { id },
    });
  }

  async getPickupDeliveryList(
    filters: GetPickupDeliveryFilterInterface,
    sortBy: "PONumber" | "createdAt" = "createdAt",
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
    const offset = (page - 1) * limit;

    const whereCondition: any = {
      userId: filters.userId || undefined,
      sellerId: filters.sellerId || undefined,
      PONumber: filters.PONumber || undefined,
      organizationId: filters.organizationId
        ? {
            contains: filters.organizationId,
            mode: "insensitive",
          }
        : undefined,
    };

    const total = await this.db.pickUpDelivery.count({ where: whereCondition });

    const purchases = await this.db.pickUpDelivery.findMany({
      where: whereCondition,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
      include: {
        user: true,
        seller: {
          include: {
            privateSeller: true,
            businessSeller: true,
          },
        },
        productsForDelivery: {
          include: {
            product: true,
          },
        },
      },
    });

    const transformedPickupDeliveries = purchases.map((purchase) => {
      const seller = purchase.seller
        ? {
            ...purchase.seller,
            ...purchase.seller.privateSeller,
            ...purchase.seller.businessSeller,
          }
        : null;

      return {
        ...purchase,
        seller,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return { pickupDeliveries: transformedPickupDeliveries, total, totalPages };
  }

  async getReceiptByID(
    id: string,
    organizationId: string
  ): Promise<PickUpDelivery & { user: User; seller: Seller }> {
    const pickUpDelivery = await this.db.pickUpDelivery.findFirst({
      where: { id, organizationId },
      include: {
        user: true,
        seller: {
          include: {
            privateSeller: true,
            businessSeller: true,
          },
        },
        productsForDelivery: {
          include: {
            product: true,
          },
        },
        organization: true,
      },
    });

    if (!pickUpDelivery) {
      throw new Error(`No delivery found with id: ${id}`);
    }

    return pickUpDelivery as PickUpDelivery & { user: User; seller: Seller };
  }
}

export default PickupDeliveryRepository;
