import { Request, Response } from "express";
import { OK, ERROR } from "@/utils/response-helper";
import PurchaseService from "@/services/purchase.service";
import ProductsPurchasedService from "@/services/products_purchased.service";
import SellerService from "@/services/seller.service";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { decrypt } from "@/utils/AES";

export default class PurchaseController {
  static async createPurchase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.payload?.id;
      const organizationId = req.payload?.organizationId;

      const { products, ...purchaseData } = req.body;
      const { sellerId } = purchaseData;

      if (!userId) {
        return ERROR(res, null, "Unauthorized: No user ID in token");
      }

      const sellerExists = await SellerService.getSeller(sellerId);

      if (!sellerExists) {
        throw new Error("Seller does not exist");
      }
      const purchase = await PurchaseService.createPurchase({
        userId,
        organizationId,
        ...purchaseData,
      });

      if (!purchase) {
        return ERROR(res, null, "Failed to create purchase");
      }

      const poducts_purchased =
        await ProductsPurchasedService.addProductsToPurchase(
          purchase.id,
          products
        );

      return OK(
        res,
        { purchase, poducts_purchased },
        "Purchase created successfully with products"
      );
    } catch (error) {
      return ERROR(res, null, error);
    }
  }

  // static async getPurchaseList(req: Request, res: Response): Promise<void> {
  //   try {
  //     const {
  //       userId,
  //       sellerId,
  //       paymentMethod,
  //       bankAccountNumber,
  //       status,
  //       orderNo,
  //       sortBy,
  //       sortOrder,
  //       page,
  //     } = req.query;
  //     const organizationId = req.payload?.organizationId;

  //     const filters = {
  //       userId: userId ? (userId as string) : undefined,
  //       sellerId: sellerId ? (sellerId as string) : undefined,
  //       paymentMethod: paymentMethod
  //         ? (paymentMethod as PaymentMethod)
  //         : undefined,
  //       bankAccountNumber: bankAccountNumber
  //         ? (bankAccountNumber as string)
  //         : undefined,
  //       status: status ? (status as OrderStatus) : undefined,
  //       orderNo: orderNo ? (orderNo as string) : undefined,
  //       organizationId: organizationId as string,
  //     };

  //     const pageNumber = page ? parseInt(page as string, 10) : 1;
  //     const sortedBy: "orderNo" | "createdAt" | "status" =
  //       sortBy === "orderNo" || sortBy === "status" ? sortBy : "createdAt";
  //     const sortedOrder: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

  //     const purchases = await PurchaseService.getPurchaseList(
  //       filters,
  //       sortedBy,
  //       sortedOrder,
  //       pageNumber
  //     );

  //     return OK(res, purchases, "Purchases retrieved successfully");
  //   } catch (error) {
  //     return ERROR(res, false, error);
  //   }
  // }

  static async getPurchaseList(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        sellerId,
        paymentMethod,
        bankAccountNumber,
        status,
        orderNo,
        sortBy,
        sortOrder,
        page,
      } = req.query;
      const organizationId = req.payload?.organizationId;

      const filters = {
        userId: userId ? (userId as string) : undefined,
        sellerId: sellerId ? (sellerId as string) : undefined,
        paymentMethod: paymentMethod
          ? (paymentMethod as PaymentMethod)
          : undefined,
        bankAccountNumber: bankAccountNumber
          ? (bankAccountNumber as string)
          : undefined,
        status: status ? (status as OrderStatus) : undefined,
        orderNo: orderNo ? (orderNo as string) : undefined,
        organizationId: organizationId as string,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const sortedBy: "orderNo" | "createdAt" | "status" =
        sortBy === "orderNo" || sortBy === "status" ? sortBy : "createdAt";
      const sortedOrder: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

      const { purchases, total, totalPages } =
        await PurchaseService.getPurchaseList(
          filters,
          sortedBy,
          sortedOrder,
          pageNumber
        );

      const decryptedPurchases = purchases.map((purchase) => {
        const decryptedUser = purchase.user
          ? {
              ...purchase.user,
              email: purchase.user.email ? decrypt(purchase.user.email) : null,
              name: purchase.user.name ? decrypt(purchase.user.name) : null,
              phone: purchase.user.phone ? decrypt(purchase.user.phone) : null,
            }
          : null;

        const decryptedSeller = purchase.seller
          ? {
              ...purchase.seller,
              email: purchase.seller.email
                ? decrypt(purchase.seller.email)
                : null,
              phone: purchase.seller.phone
                ? decrypt(purchase.seller.phone)
                : null,
            }
          : null;

        return {
          ...purchase,
          user: decryptedUser,
          seller: decryptedSeller,
        };
      });

      return OK(
        res,
        { purchases: decryptedPurchases, total, totalPages },
        "Purchases retrieved successfully"
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getReceiptByOrderNo(req: Request, res: Response) {
    try {
      const { orderNo } = req.params;

      const purchaseDetails = await PurchaseService.getReceiptByOrderNo(
        orderNo
      );
      return OK(
        res,
        purchaseDetails,
        `Purchase Details of order ${orderNo} retrived successfully`
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
