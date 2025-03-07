import express from "express";
import ReceiptController from "@/controller/receipt.controller";
import { isAuthenticated } from "@/middleware/checkAuth";

const router = express.Router();

router.post(
  "/create-receipt",
  isAuthenticated,
  ReceiptController.createReceipt
);

router.get(
  "/get-receipt/:id",
  isAuthenticated,
  ReceiptController.getSingleReceipt
);

export default router;
