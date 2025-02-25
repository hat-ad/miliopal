import { Request, Response } from "express";
import { OK, ERROR } from "@/utils/response-helper";
import PurchaseService from "@/services/purchase.service";
import ProductsPurchasedService from "@/services/products_purchased.service";
import SellerService from "@/services/seller.service";

export default class PurchaseController {
  static async createPurchase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.payload?.id;
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
}
