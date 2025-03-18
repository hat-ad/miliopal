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

export default router;
