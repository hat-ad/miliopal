import { UpdateOrganization } from "@/interfaces/organization";
import { Organization, Seller, User } from "@prisma/client";
import BaseRepository from "./base.repository";

class OrganizationRepository extends BaseRepository {
  async createOrganization(data: {
    organizationNumber: string;
  }): Promise<Organization> {
    return this.db.organization.create({
      data: {
        organizationNumber: data.organizationNumber,
        wallet: 0,
      },
    });
  }

  async getOrganizationByNumber(
    organizationNumber: string
  ): Promise<Organization | null> {
    return this.db.organization.findUnique({
      where: { organizationNumber },
    });
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.db.organization.findUnique({
      where: { id },
    });
  }

  async getOrganizationDetails(
    id: string
  ): Promise<(Organization & { users: User[]; sellers: Seller[] }) | null> {
    return this.db.organization.findUnique({
      where: { id },
      include: {
        users: true,
        sellers: true,
        products: true,
        purchases: true,
      },
    });
  }

  async updateOrganization(
    id: string,
    data: UpdateOrganization
  ): Promise<Organization | null> {
    return this.db.organization.update({
      where: { id },
      data,
    });
  }
}

export default OrganizationRepository;
