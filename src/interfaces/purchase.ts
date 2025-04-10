import {
  OrderStatus,
  PaymentMethod,
  PurchaseType,
  SellerType,
} from "@prisma/client";

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
  purchaseType?: PurchaseType;
}

export interface UpdatePurchaseInterface {
  creditOrderId?: string;
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
  name?: string;
}

export interface GetMonthlyPurchaseFilterInterface {
  productId?: string;
  userId?: string;
  sellerId?: string;
  organizationId?: string;
}
