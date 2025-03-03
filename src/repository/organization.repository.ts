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
}

export default new OrganizationRepository();
