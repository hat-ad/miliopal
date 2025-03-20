import OrganizationController from "@/controller/organization.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import { validateCreateTransaction } from "../validators/organization/createTransaction";

const router = express.Router();

router.get(
  "/get-organization-details",
  isAuthenticated,
  OrganizationController.getInstance().getOrganizationDetails
);

router.put(
  "/update-organization",
  isAuthenticated,
  OrganizationController.getInstance().updateOrganization
);

router.get(
  "/get-balance-with-employees-wallet",
  isAuthenticated,
  OrganizationController.getInstance().getOrgBalanceWithEmployeesWallet
);

router.post(
  "/create-transaction-with-organization",
  isAuthenticated,
  validateCreateTransaction,
  OrganizationController.getInstance().createTransactionWithOrg
);

router.get(
  "/create-transaction-with-employees/:actionTo",
  isAuthenticated,
  validateCreateTransaction,
  OrganizationController.getInstance().createTransactionWithEmployees
);

export default router;
