import { RepositoryFactory } from "@/factory/repository.factory";
import { InviteSellerInterface } from "@/interfaces/seller";
import { Seller, SellerInvite } from "@prisma/client";

class SellerService {
  private repositoryFactory: RepositoryFactory;

  constructor(factory?: RepositoryFactory) {
    this.repositoryFactory = factory ?? new RepositoryFactory();
  }

  async inviteSeller(data: InviteSellerInterface): Promise<SellerInvite> {
    return this.repositoryFactory
      .getSellerInviteRepository()
      .inviteSeller(data);
  }

  async getSellerInvite(id: string): Promise<SellerInvite | null> {
    return this.repositoryFactory
      .getSellerInviteRepository()
      .getSellerInvite(id);
  }
}

export default SellerService;
