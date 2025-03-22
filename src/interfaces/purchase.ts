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
  products: {
    productId: string;
    price: number;
    quantity: number;
  }[];
}

export interface CreatePurchaseRepositoryInterface {
  orderNo: string;
  userId: string;
  sellerId: string;
  organizationId: string;
  comment?: string | null;
  paymentMethod: PaymentMethod;
  bankAccountNumber?: string | null;
  status: OrderStatus;
  totalAmount: number;
  notes?: string | null;
  transactionDate?: Date | null;
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
