import { OrderStatus, PaymentMethod } from "@prisma/client";

export interface CreatePurchaseInterface {
  userId: string;
  sellerId: string;
  comment?: string;
  paymentMethod: PaymentMethod;
  bankAccountNumber?: string;
  status: OrderStatus;
  organizationId: string;
  orderNo: string;
  totalAmount: number;
  notes?: string;
}

export interface GetPurchaseFilterInterface {
  userId?: string;
  sellerId?: string;
  paymentMethod?: PaymentMethod;
  bankAccountNumber?: string;
  status?: OrderStatus;
  orderNo?: string;
  organizationId?: string;
}
