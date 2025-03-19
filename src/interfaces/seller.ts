import {
  Organization,
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
  seller: Seller;
  purchase: (Purchase & { user?: User | null })[];
  organization: Organization | null;
}
