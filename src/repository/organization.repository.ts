import PrismaService from "@/db/prisma-service";
import { PrismaClient, Organization } from "@prisma/client";

class OrganizationRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createOrganization(data: {
    organizationNumber: number;
  }): Promise<Organization> {
    return this.db.organization.create({
      data: {
        organizationNumber: data.organizationNumber,
      },
    });
  }

  async getOrganizationWithByNumber(
    organizationNumber: number
  ): Promise<Organization | null> {
    return this.db.organization.findUnique({
      where: { organizationNumber },
    });
  }

  async getOrganizationDetails(id: string): Promise<Organization | null> {
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
    data: {
      companyName?: string;
      organizationNumber?: number;
      postalCode?: string;
      city?: string;
      address?: string;
    }
  ): Promise<Organization | null> {
    return this.db.organization.update({
      where: { id },
      data,
    });
  }
}

export default new OrganizationRepository();
