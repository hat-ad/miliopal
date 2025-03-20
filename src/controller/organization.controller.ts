import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods } from "@/functions/function";
import { decrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class OrganizationController {
  private static instance: OrganizationController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): OrganizationController {
    if (!OrganizationController.instance) {
      OrganizationController.instance = new OrganizationController(factory);
    }
    return OrganizationController.instance;
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

  async getOrgBalanceWithEmployeesWallet(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }

      const organization = await this.serviceFactory
        .getOrganizationService()
        .getOrgBalanceWithEmployeesWallet(organizationId);

      return OK(res, organization, "organization retrived successfully.");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async createTransactionWithOrg(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.payload?.id;
      const organizationId = req.payload?.organizationId;

      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }

      const organization = await this.serviceFactory
        .getOrganizationService()
        .createTransactionWithOrg({
          ...req.body,
          actionBy: userId,
          organizationId,
        });

      return OK(res, organization, "Cash transaction done.");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async createTransactionWithEmployees(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.payload?.id;
      const organizationId = req.payload?.organizationId;
      const { actionTo } = req.params;

      if (!organizationId) {
        return ERROR(res, false, "Organization ID is required.");
      }

      const organization = await this.serviceFactory
        .getOrganizationService()
        .createTransactionWithEmployees({
          ...req.body,
          actionBy: userId,
          actionTo: actionTo,
          organizationId,
        });

      return OK(res, organization, "Cash transaction done.");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
