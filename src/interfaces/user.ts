import { Organization, Purchase, Role, User } from "@prisma/client";

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
}

export interface UserUpdateData {
  name?: string;
  phone?: string;
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
  buyer: User;
  purchase: Purchase[];
  organization: Organization | null;
}
