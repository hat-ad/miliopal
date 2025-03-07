import express from "express";
import ReceiptController from "@/controller/receipt.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreateReceipt } from "../validators/receipt/createReceipt.validator";

const router = express.Router();

router.post(
  "/create-receipt",
  validateCreateReceipt,
  isAuthenticated,
  ReceiptController.createReceipt
);

router.get(
  "/get-receipt/:id",
  isAuthenticated,
  ReceiptController.getSingleReceipt
);

export default router;
