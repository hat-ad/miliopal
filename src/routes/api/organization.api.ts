import OrganizationController from "@/controller/organization.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";

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

export default router;
