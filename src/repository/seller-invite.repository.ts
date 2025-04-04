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
}

export default SellerRepository;
