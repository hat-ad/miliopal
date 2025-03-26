import { ServiceFactory } from "@/factory/service.factory";
import {
  bindMethods,
  generatePurchasePDFForB2B,
  removeFile,
} from "@/functions/function";
import { GetMonthlyPurchaseFilterInterface } from "@/interfaces/purchase";
import { sendPurchaseMail } from "@/templates/email";
import { IPurchase } from "@/types/purchase";
import { decrypt } from "@/utils/AES";
import { getError } from "@/utils/common";
import { ERROR, OK } from "@/utils/response-helper";
import { OrderStatus, PaymentMethod, SellerType } from "@prisma/client";
import { Request, Response } from "express";

export default class PurchaseController {
  private static instance: PurchaseController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): PurchaseController {
    if (!PurchaseController.instance) {
      PurchaseController.instance = new PurchaseController(factory);
    }
    return PurchaseController.instance;
  }

  async createPurchase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.payload?.id;
      const organizationId = req.payload?.organizationId;

      if (!userId) return ERROR(res, null, "Unauthorized: No user ID in token");

      if (!organizationId)
        return ERROR(res, null, "No Organization ID in token");

      const purchase = await this.serviceFactory
        .getPurchaseService()
        .createPurchase({
          userId,
          organizationId,
          ...req.body,
        });

      if (!purchase) {
        return ERROR(res, null, "Failed to create purchase");
      }

      return OK(res, purchase, "Purchase created successfully with products");
    } catch (error) {
      return ERROR(res, null, error);
    }
  }

  async getPurchaseList(req: Request, res: Response): Promise<void> {
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
        from,
        to,
        sellerType,
      } = req.query;
      const organizationId = req.payload?.organizationId;

      const filters = {
        organizationId: organizationId as string,
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
        from: from ? new Date(from as string).toISOString() : undefined,
        to: to ? new Date(to as string).toISOString() : undefined,
        sellerType: sellerType ? (sellerType as SellerType) : undefined,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const sortedBy: "orderNo" | "createdAt" | "status" =
        sortBy === "orderNo" || sortBy === "status" ? sortBy : "createdAt";
      const sortedOrder: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

      const { purchases, total, totalPages } = await this.serviceFactory
        .getPurchaseService()
        .getPurchaseList(filters, sortedBy, sortedOrder, pageNumber);

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

  async getReceiptByOrderNo(req: Request, res: Response) {
    try {
      const { orderNo } = req.params;
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "No Organization ID in token");
      }
      const purchaseDetails = await this.serviceFactory
        .getPurchaseService()
        .getReceiptByOrderNo(orderNo, organizationId);
      const receiptSettings = await this.serviceFactory
        .getReceiptService()
        .getReceiptByOrganizationId(organizationId);

      if (!receiptSettings) {
        return ERROR(res, false, "Receipt not found");
      }

      const decryptedPurchaseDetails = {
        ...purchaseDetails,
        receiptSettings,
        user: purchaseDetails?.user
          ? {
              ...purchaseDetails.user,
              email: purchaseDetails.user.email
                ? decrypt(purchaseDetails.user.email)
                : null,

              name: purchaseDetails.user.name
                ? decrypt(purchaseDetails.user.name)
                : null,

              phone: purchaseDetails.user.phone
                ? decrypt(purchaseDetails.user.phone)
                : null,
            }
          : null,
        seller: purchaseDetails?.seller
          ? {
              ...purchaseDetails.seller,
              email: purchaseDetails.seller.email
                ? decrypt(purchaseDetails.seller.email)
                : null,
              phone: purchaseDetails.seller.phone
                ? decrypt(purchaseDetails.seller.phone)
                : null,
            }
          : null,
      };

      return OK(
        res,
        decryptedPurchaseDetails,
        `Purchase Details of order ${orderNo} retrived successfully`
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async creditPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { purchaseId } = req.params;
      const { creditNotes } = req.body;

      const purchase = await this.serviceFactory
        .getPurchaseService()
        .creditPurchaseOrder(purchaseId, creditNotes);
      if (!purchase) return ERROR(res, false, "purchase not found!");

      return OK(res, purchase, "Purchase created successfully with products");
    } catch (error) {
      return ERROR(res, null, error);
    }
  }

  async getMonthlyPurchaseStats(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { id, type } = req.query;
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, null, "No Organization ID in token");
      }

      const filter: GetMonthlyPurchaseFilterInterface = {
        productId: productId as string,
      };

      if (type === "BUYER") {
        filter.userId = id as string;
      } else if (type === "SELLER") {
        filter.sellerId = id as string;
      } else if (type === "ORGANIZATION") {
        filter.organizationId = organizationId;
      } else {
        return ERROR(res, null, "Invalid type. Allowed: BUYER, SELLER, ORG");
      }

      const purchase = await this.serviceFactory
        .getPurchaseService()
        .getMonthlyPurchaseStats(filter);

      if (!purchase) {
        return ERROR(res, null, "No purchase data found");
      }

      return OK(res, purchase, "Monthly purchase stats retrieved successfully");
    } catch (error) {
      return ERROR(res, getError(error), "Internal Server Error");
    }
  }

  async getSellerPurchaseStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const purchase = await this.serviceFactory
        .getPurchaseService()
        .getSellerPurchaseStats(id);
      if (!purchase) {
        return ERROR(res, null, "No purchase data found");
      }
      return OK(res, purchase, "purchase stats retrieved successfully");
    } catch (error) {
      return ERROR(res, getError(error), "Internal Server Error");
    }
  }

  async getBuyerPurchaseStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const purchase = await this.serviceFactory
        .getPurchaseService()
        .getBuyerPurchaseStats(id);
      if (!purchase) {
        return ERROR(res, null, "No purchase data found");
      }
      return OK(res, purchase, "purchase stats retrieved successfully");
    } catch (error) {
      return ERROR(res, getError(error), "Internal Server Error");
    }
  }

  async sendReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { orderNo } = req.params;
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, null, "No Organization ID found");
      }

      const purchaseDetails = await this.serviceFactory
        .getPurchaseService()
        .getReceiptByOrderNo(orderNo, organizationId);

      if (!purchaseDetails) {
        return ERROR(res, null, "No purchase data found");
      }

      if (purchaseDetails.seller.type === SellerType.BUSINESS) {
        const receiptSettings = await this.serviceFactory
          .getReceiptService()
          .getReceiptByOrganizationId(organizationId);

        if (!receiptSettings) {
          return ERROR(res, false, "Receipt not found");
        }

        const decryptedPurchaseDetails = {
          ...purchaseDetails,
          receiptSettings,
          user: purchaseDetails?.user
            ? {
                ...purchaseDetails.user,
                email: purchaseDetails.user.email
                  ? decrypt(purchaseDetails.user.email)
                  : null,

                name: purchaseDetails.user.name
                  ? decrypt(purchaseDetails.user.name)
                  : null,

                phone: purchaseDetails.user.phone
                  ? decrypt(purchaseDetails.user.phone)
                  : null,
              }
            : null,
          seller: purchaseDetails?.seller
            ? {
                ...purchaseDetails.seller,
                email: purchaseDetails.seller.email
                  ? decrypt(purchaseDetails.seller.email)
                  : null,
                phone: purchaseDetails.seller.phone
                  ? decrypt(purchaseDetails.seller.phone)
                  : null,
              }
            : null,
        } as IPurchase;
        const pathStored = await generatePurchasePDFForB2B(
          decryptedPurchaseDetails
        );

        await sendPurchaseMail(
          decryptedPurchaseDetails.seller?.email || "",
          decryptedPurchaseDetails.organization,
          pathStored
        );
        removeFile(pathStored);
      }

      return OK(res, true, "Receipt sent successfully");
    } catch (error) {
      return ERROR(res, getError(error), "Internal Server Error");
    }
  }
}
