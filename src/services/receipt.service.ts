import { RepositoryFactory } from "@/factory/repository.factory";
import {
  CreateReceiptInterface,
  UpdateReceiptInterface,
} from "@/interfaces/receipt";
import { Receipt } from "@prisma/client";

class ReceiptService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }
  async createReceipt(data: CreateReceiptInterface): Promise<Receipt | null> {
    return this.repositoryFactory.getReceiptRepository().createReceipt(data);
  }

  async getSingleReceipt(id: string): Promise<Receipt | null> {
    return this.repositoryFactory.getReceiptRepository().getSingleReceipt(id);
  }

  async getReceiptByOrganizationId(
    organizationId: string
  ): Promise<Receipt | null> {
    return this.repositoryFactory
      .getReceiptRepository()
      .getReceiptByOrganizationId(organizationId);
  }

  async updateReceipt(
    id: string,
    data: UpdateReceiptInterface
  ): Promise<Receipt | null> {
    return this.repositoryFactory
      .getReceiptRepository()
      .updateReceipt(id, data);
  }
}

export default ReceiptService;
