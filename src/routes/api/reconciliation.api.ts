import ReconciliationHistoryController from "@/controller/reconciliation.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import { validateCreateReconciliation } from "../validators/reconciliation/create-reconciliation.validator";

const router = express.Router();

router.post(
  "/create-reconciliation",
  isAuthenticated,
  validateCreateReconciliation,
  ReconciliationHistoryController.getInstance().createReconciliation
);

router.get(
  "/get-reconciliation-list",
  isAuthenticated,
  ReconciliationHistoryController.getInstance().getReconciliationList
);

router.get(
  "/get-reconciliation/:id",
  isAuthenticated,
  ReconciliationHistoryController.getInstance().getReconciliation
);

router.get(
  "/get-reconciliation-receipt/:id",
  isAuthenticated,
  ReconciliationHistoryController.getInstance().getReconciliationReceipt
);

export default router;
