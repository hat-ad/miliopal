import { OrderStatus, PaymentMethod, SellerType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface CreatePurchaseInterface {
  userId: string;
  sellerId: string;
  comment?: string;
  paymentMethod: PaymentMethod;
  bankAccountNumber?: string;
  status: OrderStatus;
  organizationId: string;
  orderNo: string;
  totalAmount: Decimal;
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
  totalAmount: Decimal;
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
  from?: string;
  to?: string;
  sellerType?: SellerType;
}

export interface GetMonthlyPurchaseFilterInterface {
  productId: string;
  userId?: string;
  sellerId?: string;
  organizationId?: string;
}
