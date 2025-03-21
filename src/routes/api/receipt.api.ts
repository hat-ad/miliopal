import ReceiptController from "@/controller/receipt.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import { validateCreateReceipt } from "../validators/receipt/createReceipt.validator";

const router = express.Router();

router.post(
  "/create-receipt",
  validateCreateReceipt,
  isAuthenticated,
  ReceiptController.createReceipt
);

router.get("/get-receipt", isAuthenticated, ReceiptController.getSingleReceipt);

router.put(
  "/update-receipt/:id",
  isAuthenticated,
  ReceiptController.updateReceipt
);

export default router;
