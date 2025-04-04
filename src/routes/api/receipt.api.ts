import ReceiptController from "@/controller/receipt.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import { validateCreateReceipt } from "../validators/receipt/createReceipt.validator";

const router = express.Router();

router.post(
  "/create-receipt",
  validateCreateReceipt,
  isAuthenticated,
  ReceiptController.getInstance().createReceipt
);

router.get(
  "/get-receipt",
  isAuthenticated,
  ReceiptController.getInstance().getSingleReceipt
);

router.put(
  "/update-receipt/:id",
  isAuthenticated,
  ReceiptController.getInstance().updateReceipt
);

export default router;
