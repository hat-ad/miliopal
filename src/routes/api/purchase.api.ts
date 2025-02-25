import express from "express";

import PurchaseController from "@/controller/purchase.controller";
import { isAuthenticated } from "@/middleware/checkAuth";

const router = express.Router();

router.post(
  "/create-purchase",
  isAuthenticated,
  PurchaseController.createPurchase
);

export default router;
