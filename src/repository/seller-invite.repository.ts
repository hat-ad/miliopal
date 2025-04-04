import { InviteSellerInterface } from "@/interfaces/seller";
import { SellerInvite } from "@prisma/client";
import BaseRepository from "./base.repository";

class SellerRepository extends BaseRepository {
  async inviteSeller(data: InviteSellerInterface): Promise<SellerInvite> {
    return this.db.sellerInvite.create({
      data: {
        email: data.email!,
        sellerType: data.sellerType,
        inviteExpiry: data.inviteExpiry,
        organizationId: data.organizationId,
      },
    });
  }

  async getSellerInvite(id: string): Promise<SellerInvite | null> {
    return this.db.sellerInvite.findUnique({
      where: {
        id,
      },
    });
  }

  async getSellerInviteByEmail(email: string): Promise<SellerInvite | null> {
    return this.db.sellerInvite.findUnique({
      where: {
        email,
      },
    });
  }

  async deleteSellerInvite(id: string): Promise<SellerInvite> {
    return this.db.sellerInvite.delete({
      where: {
        id,
      },
    });
  }
}

export default SellerRepository;
