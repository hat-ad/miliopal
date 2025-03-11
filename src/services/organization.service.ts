import { UpdateOrganization } from "@/interfaces/organization";
import organizationRepository from "@/repository/organization.repository";
import { Organization, Seller, User } from "@prisma/client";

class OrganizationService {
  static async createOrganization(data: {
    organizationNumber: string;
  }): Promise<Organization> {
    return organizationRepository.createOrganization(data);
  }

  static async getOrganizationByNumber(
    organizationNumber: string
  ): Promise<Organization | null> {
    return organizationRepository.getOrganizationByNumber(organizationNumber);
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    return organizationRepository.getOrganizationById(id);
  }

  static async getOrganizationDetails(
    organizationId: string
  ): Promise<(Organization & { users: User[]; sellers: Seller[] }) | null> {
    return organizationRepository.getOrganizationDetails(organizationId);
  }

  static async updateOrganization(
    organizationId: string,
    data: UpdateOrganization
  ): Promise<Organization | null> {
    return organizationRepository.updateOrganization(organizationId, data);
  }
}

export default OrganizationService;
