import {
  CreateReceiptInterface,
  UpdateReceiptInterface,
} from "@/interfaces/receipt";
import { Receipt } from "@prisma/client";
import BaseRepository from "./base.repository";

class ReceiptRepository extends BaseRepository {
  async createReceipt(data: CreateReceiptInterface): Promise<Receipt> {
    return this.db.receipt.create({
      data: {
        organizationId: data.organizationId,
        startingOrderNumber: data.startingOrderNumber,
        currentOrderNumber: data.currentOrderNumber,
        logo: data.logo,
        receiptText: data.receiptText,
        bankReceiptText: data.bankReceiptText,
      },
    });
  }

  async getSingleReceipt(id: string): Promise<Receipt | null> {
    return this.db.receipt.findUnique({
      where: { id },
      include: { organization: true },
    });
  }

  async getReceiptByOrganizationId(
    organizationId: string
  ): Promise<Receipt | null> {
    return this.db.receipt.findFirst({
      where: { organizationId },
      include: { organization: true },
    });
  }

  async updateReceipt(
    id: string,
    data: UpdateReceiptInterface
  ): Promise<Receipt> {
    return this.db.receipt.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async updateReceiptInternal(
    id: string,
    data: Partial<
      Omit<Receipt, "id" | "createdAt" | "updatedAt" | "organizationId">
    >
  ): Promise<Receipt> {
    return this.db.receipt.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }
}

export default ReceiptRepository;
