import express from "express";

import PurchaseController from "@/controller/purchase.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreatePurchase } from "../validators/purchase/createPurchase.validator";

const router = express.Router();

router.post(
  "/create-purchase",
  isAuthenticated,
  validateCreatePurchase,
  PurchaseController.getInstance().createPurchase
);

router.get(
  "/get-purchase-list",
  isAuthenticated,
  PurchaseController.getInstance().getPurchaseList
);
router.get(
  "/get-receipt-by-orderno/:orderNo",
  isAuthenticated,
  PurchaseController.getInstance().getReceiptByOrderNo
);

router.post(
  "/credit-purchase-order/:purchaseId",
  isAuthenticated,
  PurchaseController.getInstance().creditPurchaseOrder
);

router.get(
  "/get-monthly-purchase-stats",
  isAuthenticated,
  PurchaseController.getInstance().getMonthlyPurchaseStats
);

router.get(
  "/get-buyer-purchase-stats/:id",
  isAuthenticated,
  PurchaseController.getInstance().getBuyerPurchaseStats
);
router.get(
  "/get-seller-purchase-stats/:id",
  isAuthenticated,
  PurchaseController.getInstance().getSellerPurchaseStats
);
router.get(
  "/send-purchase-receipt/:orderNo",
  isAuthenticated,
  PurchaseController.getInstance().sendReceipt
);

export default router;
