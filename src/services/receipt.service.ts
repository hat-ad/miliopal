import { Receipt } from "@prisma/client";
import receiptRepository from "@/repository/receipt.repository";

class ReceiptService {
  static async createReceipt(data: {
    organizationId: string;
    startingOrderNumber: number;
    currentOrderNumber: number;
    logo: string;
    receiptText?: string;
  }): Promise<Receipt | null> {
    return receiptRepository.createReceipt(data);
  }

  static async getSingleReceipt(id: string): Promise<Receipt | null> {
    return receiptRepository.getSingleReceipt(id);
  }

  static async updateReceipt(
    id: string,
    data: {
      logo?: string;
      receiptText?: string;
    }
  ): Promise<Receipt | null> {
    return receiptRepository.updateReceipt(id, data);
  }
}

export default ReceiptService;
