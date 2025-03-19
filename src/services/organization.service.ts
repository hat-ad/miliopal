import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import { CreateCashHistoryInterface } from "@/interfaces/cash-history";
import {
  OrgBalanceWithEmployeesWalletInterface,
  UpdateOrganization,
} from "@/interfaces/organization";
import { CashHistory, Organization, Seller, User } from "@prisma/client";

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

  async createTransaction(data: CreateCashHistoryInterface): Promise<{
    organization: Organization;
    cashHistory: CashHistory;
  }> {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);
      const organizationRepo = factory.getOrganizationRepository();
      const cashHistoryRepo = factory.getCashHistoryRepository();

      const organization = await organizationRepo.getOrganizationById(
        data.organizationId
      );

      if (!organization) {
        throw new Error("Organization not found.");
      }

      let updatedAmount = organization.wallet;

      if (data.type === "DEPOSIT") {
        updatedAmount += data.amount || 0;
      } else if (data.type === "WITHDRAW") {
        updatedAmount -= data.amount!;
      } else {
        throw new Error(
          "Invalid transaction type. Use 'DEPOSIT' or 'WITHDRAW'."
        );
      }

      const updatedOrganization = await organizationRepo.updateOrganization(
        data.organizationId,
        {
          wallet: updatedAmount,
        }
      );

      const cashHistory = await cashHistoryRepo.createCashHistory(data);

      return { organization: updatedOrganization!, cashHistory };
    });
  }

  async getOrgBalanceWithEmployeesWallet(
    organizationId: string
  ): Promise<OrgBalanceWithEmployeesWalletInterface> {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);
      const organizationRepo = factory.getOrganizationRepository();

      const organization = await organizationRepo.getOrganizationDetails(
        organizationId
      );

      if (!organization) {
        throw new Error("Organization not found.");
      }

      const users = organization.users;

      const employesWallet = users.map((user) => ({
        userId: user.id,
        userName: user.name,
        walletBalance: user.wallet ?? 0,
      }));

      return {
        companyBalance: organization.wallet,
        employees: employesWallet,
      };
    });
  }
}

export default OrganizationService;
