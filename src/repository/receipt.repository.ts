import PrismaService from "@/db/prisma-service";
import { User, PrismaClient, Role, Receipt } from "@prisma/client";

class ReceiptRepository {
  db: PrismaClient;
  constructor() {
    this.db = PrismaService.getInstance();
  }

  async createReceipt(data: {
    organizationId: string;
    startingOrderNumber: number;
    currentOrderNumber: number;
    logo: string;
    receiptText?: string;
  }): Promise<Receipt> {
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
}

export default new ReceiptRepository();
