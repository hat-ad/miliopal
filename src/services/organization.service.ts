import { RepositoryFactory } from "@/factory/repository.factory";
import { UpdateOrganization } from "@/interfaces/organization";
import { Organization, Seller, User } from "@prisma/client";

class OrganizationService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async createOrganization(data: {
    organizationNumber: string;
  }): Promise<Organization> {
    return this.repositoryFactory
      .getOrganizationRepository()
      .createOrganization(data);
  }

  async getOrganizationByNumber(
    organizationNumber: string
  ): Promise<Organization | null> {
    return this.repositoryFactory
      .getOrganizationRepository()
      .getOrganizationByNumber(organizationNumber);
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.repositoryFactory
      .getOrganizationRepository()
      .getOrganizationById(id);
  }

  async getOrganizationDetails(
    organizationId: string
  ): Promise<(Organization & { users: User[]; sellers: Seller[] }) | null> {
    return this.repositoryFactory
      .getOrganizationRepository()
      .getOrganizationDetails(organizationId);
  }

  async updateOrganization(
    organizationId: string,
    data: UpdateOrganization
  ): Promise<Organization | null> {
    return this.repositoryFactory
      .getOrganizationRepository()
      .updateOrganization(organizationId, data);
  }
}

export default OrganizationService;
