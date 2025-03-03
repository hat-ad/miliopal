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
}

export default OrganizationService;
