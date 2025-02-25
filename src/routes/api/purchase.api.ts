import express from "express";

import PurchaseController from "@/controller/purchase.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreatePurchase } from "../validators/purchase/createPurchase.validator";

const router = express.Router();

router.post(
  "/create-purchase",
  isAuthenticated,
  validateCreatePurchase,
  PurchaseController.createPurchase
);

export default router;
