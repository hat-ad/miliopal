import { RepositoryFactory } from "@/factory/repository.factory";
import { InviteSellerInterface } from "@/interfaces/seller";
import { SellerInvite } from "@prisma/client";

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

  async getSellerInviteByEmail(email: string): Promise<SellerInvite | null> {
    const sellerInvite = await this.repositoryFactory
      .getSellerInviteRepository()
      .getSellerInviteByEmail(email);

    if (sellerInvite && sellerInvite.inviteExpiry) {
      const inviteExpiry = new Date(sellerInvite.inviteExpiry);
      if (inviteExpiry.getTime() < new Date().getTime()) {
        await this.repositoryFactory
          .getSellerInviteRepository()
          .deleteSellerInvite(sellerInvite.id);

        return null;
      }
    }
    return sellerInvite;
  }
}

export default SellerService;
