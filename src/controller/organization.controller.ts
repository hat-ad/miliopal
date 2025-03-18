import { ServiceFactory } from "@/factory/service.factory";
import { decrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class OrganizationController {
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
  }

  static getInstance(factory?: ServiceFactory): OrganizationController {
    return new OrganizationController(factory);
  }

  async getOrganizationDetails(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }

      const organization = await this.serviceFactory
        .getOrganizationService()
        .getOrganizationDetails(organizationId);

      if (!organization) {
        return ERROR(res, false, "Organization not found.");
      }

      const decryptedUsers = organization.users.map((user) => ({
        ...user,
        email: user.email ? decrypt(user.email) : null,
        name: user.name ? decrypt(user.name) : null,
        phone: user.phone ? decrypt(user.phone) : null,
      }));

      const decryptedSellers = organization.sellers.map((seller) => ({
        ...seller,
        email: seller.email ? decrypt(seller.email) : null,
        phone: seller.phone ? decrypt(seller.phone) : null,
      }));

      const decryptedOrganization = {
        ...organization,
        users: decryptedUsers,
        sellers: decryptedSellers,
      };

      return OK(
        res,
        decryptedOrganization,
        "Organization retrieved successfully"
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async updateOrganization(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }
      const organization = await this.serviceFactory
        .getOrganizationService()
        .updateOrganization(organizationId, { ...req.body });
      return OK(res, organization, "Organization updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
