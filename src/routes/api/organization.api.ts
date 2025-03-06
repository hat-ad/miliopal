import express from "express";
import OrganizationController from "@/controller/organization.controller";
import { isAuthenticated } from "@/middleware/checkAuth";

const router = express.Router();

router.get(
  "/get-organization-details",
  isAuthenticated,
  OrganizationController.getOrganizationDetails
);

router.put(
  "/update-organization",
  isAuthenticated,
  OrganizationController.updateOrganization
);

export default router;
