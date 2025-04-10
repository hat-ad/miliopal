import { PaymentMethod, Purchase, Role, Seller, User } from "@prisma/client";

export interface CreateUserInterface {
  email: string;
  role: Role;
  organizationId: string;
  name: string;
}

export interface CreateUserInternalInterface {
  email: string;
  password?: string;
  phone?: string;
  organizationId: string;
  name?: string;
  isActive: boolean;
}

export interface UserUpdateData {
  name?: string;
  phone?: string;
  role?: Role;
  password?: string;
  token?: string;
  isActive?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  otp?: string | null;
  otpExpiry?: Date | null;
  wallet?: number;
  lastReconciled?: Date | null;
}

export interface GetUsersFilterInterface {
  name?: string;
  email?: string;
  phone?: string;
  organizationId?: string;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface UserSellingHistoryInterface {
  buyer: User | null;
  purchase: (Purchase & {
    user?: User | null;
    seller?: Seller | null;
  })[];
  total: number;
  totalPages: number;
}

export interface GetBuyerBuyingHistoryFilterInterface {
  paymentMethod?: PaymentMethod;
  from?: string;
  to?: string;
}
