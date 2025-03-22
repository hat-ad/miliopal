import PrismaService from "@/db/prisma-service";
import { RepositoryFactory } from "@/factory/repository.factory";
import { CreateCashHistoryInterface } from "@/interfaces/cash-history";
import {
  OrgBalanceWithEmployeesWalletInterface,
  UpdateOrganization,
} from "@/interfaces/organization";
import {
  CashHistory,
  CashHistoryType,
  Organization,
  Seller,
  TodoListEvent,
  User,
} from "@prisma/client";

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

  async createTransactionWithOrg(data: CreateCashHistoryInterface): Promise<{
    organization: Organization;
    cashHistory: CashHistory;
  }> {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);
      const organizationRepo = factory.getOrganizationRepository();
      const cashHistoryRepo = factory.getCashHistoryRepository();
      const todoListRepo = factory.getTodoListRepository();

      const organization = await organizationRepo.getOrganizationById(
        data.organizationId
      );

      if (!organization) {
        throw new Error("Organization not found.");
      }

      let updatedAmount = organization.wallet;

      if (data.type === CashHistoryType.DEPOSIT) {
        updatedAmount = updatedAmount + data.amount;
      } else if (data.type === CashHistoryType.WITHDRAW) {
        updatedAmount = updatedAmount - data.amount!;
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
      todoListRepo.registerEvent(
        TodoListEvent.COMPANY_CASH_BALANCE_BELOW_THRESHOLD,
        { organizationId: data.organizationId }
      );

      return { organization: updatedOrganization!, cashHistory };
    });
  }

  async createTransactionWithEmployees(
    data: CreateCashHistoryInterface
  ): Promise<{
    user: User;
    organization: Organization;
    cashHistory: CashHistory;
  }> {
    return PrismaService.getInstance().$transaction(async (tx) => {
      const factory = new RepositoryFactory(tx);
      const userRepo = factory.getUserRepository();
      const organizationRepo = factory.getOrganizationRepository();
      const cashHistoryRepo = factory.getCashHistoryRepository();
      const todoListRepo = factory.getTodoListRepository();

      const organization = await organizationRepo.getOrganizationById(
        data.organizationId
      );

      if (!organization) throw new Error("Organization not found.");

      const user = await userRepo.getUser(data.actionTo);
      if (!user) throw new Error("user not found!");

      let updatedUserAmount = user.wallet;
      let updatedOrgAmount = organization.wallet;

      if (data.type === CashHistoryType.DEPOSIT) {
        updatedUserAmount = updatedUserAmount + data.amount;
        updatedOrgAmount = updatedOrgAmount - data.amount;
      } else if (data.type === CashHistoryType.WITHDRAW) {
        updatedUserAmount = updatedUserAmount - data.amount;
        updatedOrgAmount = updatedOrgAmount + data.amount;
      } else {
        throw new Error(
          "Invalid transaction type. Use 'DEPOSIT' or 'WITHDRAW'."
        );
      }

      const updatedUser = await userRepo.updateUser(data.actionTo, {
        wallet: updatedUserAmount,
      });

      const updatedOrganization = await organizationRepo.updateOrganization(
        data.organizationId,
        {
          wallet: updatedOrgAmount,
        }
      );
      const cashHistory = await cashHistoryRepo.createCashHistory(data);

      todoListRepo.registerEvent(
        TodoListEvent.INDIVIDUAL_CASH_BALANCE_BELOW_THRESHOLD,
        { organizationId: user.organizationId, userId: user.id }
      );
      todoListRepo.registerEvent(
        TodoListEvent.INDIVIDUAL_CASH_BALANCE_ABOVE_THRESHOLD,
        { organizationId: user.organizationId, userId: user.id }
      );
      return {
        user: updatedUser!,
        organization: updatedOrganization!,
        cashHistory,
      };
    });
  }
}

export default OrganizationService;
