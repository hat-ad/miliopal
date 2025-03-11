import { Receipt } from "@prisma/client";
import receiptRepository from "@/repository/receipt.repository";
import {
  CreateReceiptInterface,
  UpdateReceiptInterface,
} from "@/interfaces/receipt";

class ReceiptService {
  static async createReceipt(
    data: CreateReceiptInterface
  ): Promise<Receipt | null> {
    return receiptRepository.createReceipt(data);
  }

  static async getSingleReceipt(id: string): Promise<Receipt | null> {
    return receiptRepository.getSingleReceipt(id);
  }

  static async getReceiptByOrganizationId(
    organizationId: string
  ): Promise<Receipt | null> {
    return receiptRepository.getReceiptByOrganizationId(organizationId);
  }

  static async updateReceipt(
    id: string,
    data: UpdateReceiptInterface
  ): Promise<Receipt | null> {
    return receiptRepository.updateReceipt(id, data);
  }
}

export default ReceiptService;
