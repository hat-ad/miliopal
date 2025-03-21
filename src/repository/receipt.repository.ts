import PrismaService from "@/db/prisma-service";
import {
  CreateReceiptInterface,
  UpdateReceiptInterface,
} from "@/interfaces/receipt";
import { PrismaClient, Receipt } from "@prisma/client";

class ReceiptRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createReceipt(data: CreateReceiptInterface): Promise<Receipt> {
    return this.db.receipt.create({
      data: {
        organizationId: data.organizationId,
        startingOrderNumber: data.startingOrderNumber,
        currentOrderNumber: data.currentOrderNumber,
        logo: data.logo,
        receiptText: data.receiptText,
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
}

export default new ReceiptRepository();
