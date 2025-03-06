import { OK, ERROR, BAD } from "@/utils/response-helper";
import { Request, Response } from "express";
import AuthService from "@/services/auth.service";
import { generateToken } from "@/functions/function";
import OrganizationService from "@/services/organization.service";

export default class OrganizationController {
  static async getOrganizationDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }
      const organization = await OrganizationService.getOrganizationDetails(
        organizationId
      );
      return OK(res, organization, "Organization retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async updateOrganization(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }
      const organization = await OrganizationService.updateOrganization(
        organizationId,
        { ...req.body }
      );
      return OK(res, organization, "Organization updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
