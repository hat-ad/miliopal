import AuthRepository from "@/repository/auth.repository";
import bcrypt from "bcrypt";
import { User, Role, Organization } from "@prisma/client";
import organizationRepository from "@/repository/organization.repository";

class OrganizationService {
  static async createOrganization(data: {
    organizationNumber: number;
  }): Promise<Organization> {
    return organizationRepository.createOrganization(data);
  }

  static async getOrganizationByNumber(
    organizationNumber: number
  ): Promise<Organization | null> {
    return organizationRepository.getOrganizationWithByNumber(
      organizationNumber
    );
  }

  static async getOrganizationDetails(
    organizationId: string
  ): Promise<Organization | null> {
    return organizationRepository.getOrganizationDetails(organizationId);
  }

  static async updateOrganization(
    organizationId: string,
    data: {
      companyName?: string;
      organizationNumber?: number;
      postalCode?: string;
      city?: string;
      address?: string;
    }
  ): Promise<Organization | null> {
    return organizationRepository.updateOrganization(organizationId, data);
  }
}

export default OrganizationService;
