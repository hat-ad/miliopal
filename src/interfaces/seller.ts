import {
  PaymentMethod,
  Purchase,
  Seller,
  SellerType,
  User,
} from "@prisma/client";

export interface CreateSellerInterface {
  email: string;
  organizationId: string;
  type: SellerType;
  name?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  companyName?: string;
  contactPerson?: string;
  organizationNumber?: string;
  bankAccountNumber?: string;
  paymentMethod?: PaymentMethod;
  isDeleted?: boolean;
}

export interface InviteSellerInterface {
  email?: string;
  inviteExpiry?: Date | null;
}

export interface GetSellersFilterInterface {
  email?: string;
  organizationId?: string;
  type?: SellerType;
  name?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  companyName?: string;
  contactPerson?: string;
  organizationNumber?: string;
  isArchived?: boolean;
}

export interface UpdateSellerInterface {
  email: string;
  type: SellerType;
  name?: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  companyName?: string;
  contactPerson?: string;
  bankAccountNumber?: string;
  organizationNumber?: string;
  isDeleted?: boolean;
  isArchived?: boolean;
}

export interface SellerSellingHistoryInterface {
  seller: Seller | null;
  purchase: (Purchase & {
    user?: User | null;
    seller?: Seller | null;
  })[];
  total: number;
  totalPages: number;
}

export interface GetSellerSellingHistoryFilterInterface {
  paymentMethod?: PaymentMethod;
  from?: string;
  to?: string;
}
