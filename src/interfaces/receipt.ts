export interface CreateReceiptInterface {
  organizationId: string;
  startingOrderNumber: number;
  currentOrderNumber: number;
  logo: string;
  receiptText?: string;
}

export interface UpdateReceiptInterface {
  logo?: string;
  receiptText?: string;
}
