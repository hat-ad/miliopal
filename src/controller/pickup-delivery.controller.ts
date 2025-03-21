import PickupDeliveryService from "@/services/pickup-delivery.service";
import ProductsPickupService from "@/services/product-pickup-delivery.service";
import SellerService from "@/services/seller.service";
import { decrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";

import { Request, Response } from "express";

export default class PickupDeliveryController {
  static async createPickupDelivery(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.payload?.id;
      const organizationId = req.payload?.organizationId;
      const { products, sellerId, PONumber, comment } = req.body;

      if (!userId) return ERROR(res, null, "Unauthorized: No user ID in token");

      if (!organizationId)
        return ERROR(res, null, "No Organization ID in token");

      const sellerExists = await SellerService.getSeller(sellerId);

      if (!sellerExists) {
        throw new Error("Seller does not exist");
      }

      const pickUpDelivery = await PickupDeliveryService.createPickupDelivery({
        userId,
        organizationId,
        sellerId,
        PONumber,
        comment,
      });

      if (!pickUpDelivery) {
        return ERROR(res, null, "Failed to create pickup delivery");
      }

      const products_for_delivery =
        await ProductsPickupService.addProductsToPickup(
          pickUpDelivery.id,
          products
        );

      return OK(
        res,
        { pickUpDelivery, products_for_delivery },
        "Pickup delivery created successfully with products"
      );
    } catch (error) {
      return ERROR(res, null, error);
    }
  }

  static async getPickupDeliveryList(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { userId, sellerId, PONumber, sortBy, sortOrder, page } = req.query;
      const organizationId = req.payload?.organizationId;

      const filters = {
        userId: userId ? (userId as string) : undefined,
        sellerId: sellerId ? (sellerId as string) : undefined,
        PONumber: PONumber ? (PONumber as string) : undefined,
        organizationId: organizationId as string,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const sortedBy: "PONumber" | "createdAt" =
        sortBy === "PONumber" || sortBy === "createdAt" ? sortBy : "createdAt";
      const sortedOrder: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

      const { pickupDeliveries, total, totalPages } =
        await PickupDeliveryService.getPickupDeliveryList(
          filters,
          sortedBy,
          sortedOrder,
          pageNumber
        );

      const decryptedPickupDelivery = pickupDeliveries.map((pickupDelivery) => {
        const decryptedUser = pickupDelivery.user
          ? {
              ...pickupDelivery.user,
              email: pickupDelivery.user.email
                ? decrypt(pickupDelivery.user.email)
                : null,
              name: pickupDelivery.user.name
                ? decrypt(pickupDelivery.user.name)
                : null,
              phone: pickupDelivery.user.phone
                ? decrypt(pickupDelivery.user.phone)
                : null,
            }
          : null;

        const decryptedSeller = pickupDelivery.seller
          ? {
              ...pickupDelivery.seller,
              email: pickupDelivery.seller.email
                ? decrypt(pickupDelivery.seller.email)
                : null,
              phone: pickupDelivery.seller.phone
                ? decrypt(pickupDelivery.seller.phone)
                : null,
            }
          : null;

        return {
          ...pickupDelivery,
          user: decryptedUser,
          seller: decryptedSeller,
        };
      });

      return OK(
        res,
        { pickupDeliveries: decryptedPickupDelivery, total, totalPages },
        "Pickup deliveries retrieved successfully"
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getReceiptByID(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "No Organization ID in token");
      }
      const pickUpDeliveryDetails = await PickupDeliveryService.getReceiptById(
        id,
        organizationId
      );

      const decryptedpickUpDeliveryDetails = {
        ...pickUpDeliveryDetails,
        user: pickUpDeliveryDetails?.user
          ? {
              ...pickUpDeliveryDetails.user,
              email: pickUpDeliveryDetails.user.email
                ? decrypt(pickUpDeliveryDetails.user.email)
                : null,

              name: pickUpDeliveryDetails.user.name
                ? decrypt(pickUpDeliveryDetails.user.name)
                : null,

              phone: pickUpDeliveryDetails.user.phone
                ? decrypt(pickUpDeliveryDetails.user.phone)
                : null,
            }
          : null,
        seller: pickUpDeliveryDetails?.seller
          ? {
              ...pickUpDeliveryDetails.seller,
              email: pickUpDeliveryDetails.seller.email
                ? decrypt(pickUpDeliveryDetails.seller.email)
                : null,
              phone: pickUpDeliveryDetails.seller.phone
                ? decrypt(pickUpDeliveryDetails.seller.phone)
                : null,
            }
          : null,
      };

      return OK(
        res,
        decryptedpickUpDeliveryDetails,
        `Purchase Details of id ${id} retrived successfully`
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
