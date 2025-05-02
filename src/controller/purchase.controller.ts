import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods, generatePurchasePDFForB2B } from "@/functions/function";
import { GetMonthlyPurchaseFilterInterface } from "@/interfaces/purchase";
import { sendPurchaseMail } from "@/templates/email";
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
        sortBy,
        sortOrder,
        page,
        limit,
        from,
        to,
        sellerType,
        search,
      } = req.query;
      let { orderNo, name } = req.query;
      const organizationId = req.payload?.organizationId;

      const orderRegex = /^(ORD-\d+|CD-\d+|\d+)$/;

      if (search && orderRegex.test(search as string)) {
        orderNo = search;
      } else if (search) {
        name = search;
      }

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
        name: name ? (name as string) : undefined,
        from: from ? new Date(from as string).toISOString() : undefined,
        to: to ? new Date(to as string).toISOString() : undefined,
        sellerType: sellerType ? (sellerType as SellerType) : undefined,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const pageSize = limit ? parseInt(limit as string, 10) : 10;
      const sortedBy: "orderNo" | "createdAt" | "status" =
        sortBy === "orderNo" || sortBy === "status" ? sortBy : "createdAt";
      const sortedOrder: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

      const { purchases, total, totalPages } = await this.serviceFactory
        .getPurchaseService()
        .getPurchaseList(filters, sortedBy, sortedOrder, pageNumber, pageSize);

      const decryptedPurchases = purchases.map((purchase) => {
        const decryptedUser = purchase.user
          ? {
              ...purchase.user,
              email: purchase.user.email ? decrypt(purchase.user.email) : null,
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
      const { id, type, productId } = req.query;
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, null, "No Organization ID in token");
      }

      const filter: GetMonthlyPurchaseFilterInterface = {
        productId: productId ? (productId as string) : undefined,
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
      const organizationId = req.payload?.organizationId;
      const { id } = req.params;
      const purchase = await this.serviceFactory
        .getPurchaseService()
        .getSellerPurchaseStats(id, organizationId as string);
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
      const organizationId = req.payload?.organizationId;
      const { id } = req.params;
      const purchase = await this.serviceFactory
        .getPurchaseService()
        .getBuyerPurchaseStats(id, organizationId as string);
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
      // const { orderNo } = req.params;
      // const organizationId = req.payload?.organizationId;

      // if (!organizationId) {
      //   return ERROR(res, null, "No Organization ID found");
      // }

      // const purchaseDetails = await this.serviceFactory
      //   .getPurchaseService()
      //   .getReceiptByOrderNo(orderNo, organizationId);

      // if (!purchaseDetails) {
      //   return ERROR(res, null, "No purchase data found");
      // }

      // if (purchaseDetails.seller.type === SellerType.BUSINESS) {
      //   const receiptSettings = await this.serviceFactory
      //     .getReceiptService()
      //     .getReceiptByOrganizationId(organizationId);

      //   if (!receiptSettings) {
      //     return ERROR(res, false, "Receipt not found");
      //   }

      //   const decryptedPurchaseDetails = {
      //     ...purchaseDetails,
      //     receiptSettings,
      //     user: purchaseDetails?.user
      //       ? {
      //           ...purchaseDetails.user,
      //           email: purchaseDetails.user.email
      //             ? decrypt(purchaseDetails.user.email)
      //             : null,

      //           phone: purchaseDetails.user.phone
      //             ? decrypt(purchaseDetails.user.phone)
      //             : null,
      //         }
      //       : null,
      //     seller: purchaseDetails?.seller
      //       ? {
      //           ...purchaseDetails.seller,
      //           email: purchaseDetails.seller.email
      //             ? decrypt(purchaseDetails.seller.email)
      //             : null,
      //           phone: purchaseDetails.seller.phone
      //             ? decrypt(purchaseDetails.seller.phone)
      //             : null,
      //         }
      //       : null,
      //   } as IPurchase;
      // const pathStored = await generatePurchasePDFForB2B(
      //   decryptedPurchaseDetails
      // );
      const pathStored = await generatePurchasePDFForB2B({
        id: "bb596e33-9275-4e96-b7b0-4f89931b888c",
        orderNo: "ORD-14",
        comment: "",
        paymentMethod: "BANK_TRANSFER",
        bankAccountNumber: null,
        transactionDate: null,
        totalAmount: 40,
        notes: null,
        sellerId: "fc53a269-c2fc-46ad-9544-6c1b3e6a7262",
        userId: "5ab45ca2-e652-4b5d-a564-1669df976de0",
        status: "PAID",
        isArchived: false,
        organizationId: "679440cc-58f1-4297-9fb0-fe330b99b057",
        creditOrderId: null,
        purchaseType: "PURCHASE",
        createdAt: "2025-04-15T08:34:38.894Z",
        updatedAt: "2025-04-15T08:34:38.894Z",
        user: {
          id: "5ab45ca2-e652-4b5d-a564-1669df976de0",
          name: "Arzy Boroowa",
          phone: "1234567890",
          otp: "899350",
          otpExpiry: "2025-04-21T06:28:59.946Z",
          email: "arzyaman@outlook.com",
          password:
            "$2b$10$DTXqyW5zN8SNDDUAnMjrberwOy.nTGYJmoWTw1DfV7pY4shEe8QHK",
          role: "ADMIN",
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YWI0NWNhMi1lNjUyLTRiNWQtYTU2NC0xNjY5ZGY5NzZkZTAiLCJpYXQiOjE3NDYxNzE1MzgsImV4cCI6MTc0NjM0NDMzOH0.lvJ4Zpj01R4GOpzHMoa1Gfku3lsEtWdhPC1spBKbJMk",
          isActive: false,
          isArchived: false,
          isDeleted: false,
          organizationId: "679440cc-58f1-4297-9fb0-fe330b99b057",
          wallet: 10000,
          lastReconciled: "2025-04-15T08:36:06.718Z",
          createdAt: "2025-04-10T13:35:10.822Z",
          updatedAt: "2025-05-02T07:38:58.960Z",
        },
        seller: {
          id: "fc53a269-c2fc-46ad-9544-6c1b3e6a7262",
          email: "kajsa@norskhub.no",
          type: "BUSINESS",
          phone: "94252002",
          address: "Neskollen 27",
          postalCode: "3233",
          city: "Sandefjord",
          bankAccountNumber: null,
          paymentMethod: "BANK_TRANSFER",
          isArchived: false,
          isDeleted: false,
          organizationId: "679440cc-58f1-4297-9fb0-fe330b99b057",
          createdAt: "2025-04-15T08:11:20.605Z",
          updatedAt: "2025-04-15T08:11:20.605Z",
          privateSeller: null,
          businessSeller: {
            id: "fc53a269-c2fc-46ad-9544-6c1b3e6a7262",
            companyName: "Norsk Hub AS",
            contactPerson: "Arzyaman Boroowa",
            organizationNumber: "45962145",
            createdAt: "2025-04-15T08:11:20.605Z",
            updatedAt: "2025-04-15T08:11:20.605Z",
          },
        },
        productsPurchased: [
          {
            id: "9dd4c7b2-e092-4b5c-8876-9ad31ca936ee",
            productId: "53f97f63-4786-4ea5-9361-bfdeb1b1484b",
            price: 20,
            quantity: 2,
            purchaseId: "bb596e33-9275-4e96-b7b0-4f89931b888c",
            createdAt: "2025-04-15T08:34:38.896Z",
            updatedAt: "2025-04-15T08:34:38.896Z",
            product: {
              id: "53f97f63-4786-4ea5-9361-bfdeb1b1484b",
              name: "Europall B - Pick up",
              price: 20,
              isDeleted: false,
              isArchived: false,
              organizationId: "679440cc-58f1-4297-9fb0-fe330b99b057",
              createdAt: "2025-04-10T17:01:17.670Z",
              updatedAt: "2025-04-10T17:01:17.670Z",
            },
          },
        ],
        organization: {
          id: "679440cc-58f1-4297-9fb0-fe330b99b057",
          companyName: "Miljøpall AS",
          address: "Borgeskogen 16",
          postalCode: "3160",
          city: "Stokke",
          organizationNumber: "987 6556 163",
          wallet: 13700,
          phone: "+4745416454",
          email: "post@miljopall.no",
          createdAt: "2025-04-10T13:35:10.746Z",
          updatedAt: "2025-04-15T08:32:24.543Z",
        },
        receiptSettings: {
          id: "679440cc-58f1-4297-9fb0-fe330b99b058",
          organizationId: "679440cc-58f1-4297-9fb0-fe330b99b057",
          startingOrderNumber: 1,
          currentOrderNumber: 19,
          logo: "data:image/png;base64,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",
          receiptText:
            "This invoice is issued on behalf of the seller, and the seller is solely responsible for tax calculation and reporting to the authorities. Miljøpall AS is not responsible for reporting, taxes, VAT, or any other obligations on behalf of the seller. If the seller exceeds the threshold for VAT-liable turnover, the seller is obliged to issue invoices including VAT. The seller is responsible for assessing tax liability and for all necessary reporting.",
          createdAt: "2025-04-10T13:37:16.470Z",
          updatedAt: "2025-04-21T06:51:45.892Z",
          organization: {
            id: "679440cc-58f1-4297-9fb0-fe330b99b057",
            companyName: "Miljøpall AS",
            address: "Borgeskogen 16",
            postalCode: "3160",
            city: "Stokke",
            organizationNumber: "987 6556 163",
            wallet: 13700,
            phone: "+4745416454",
            email: "post@miljopall.no",
            createdAt: "2025-04-10T13:35:10.746Z",
            updatedAt: "2025-04-15T08:32:24.543Z",
          },
        },
      });
      await sendPurchaseMail(
        "ashis@yopmail.com",
        {
          id: "679440cc-58f1-4297-9fb0-fe330b99b057",
          companyName: "Miljøpall AS",
          address: "Borgeskogen 16",
          postalCode: "3160",
          city: "Stokke",
          organizationNumber: "987 6556 163",
          wallet: 13700,
          phone: "+4745416454",
          email: "post@miljopall.no",
          createdAt: "2025-04-10T13:35:10.746Z",
          updatedAt: "2025-04-15T08:32:24.543Z",
        },
        pathStored
      );
      // removeFile(pathStored);

      return OK(res, true, "Receipt sent successfully");
    } catch (error) {
      return ERROR(res, getError(error), "Internal Server Error");
    }
  }
}
