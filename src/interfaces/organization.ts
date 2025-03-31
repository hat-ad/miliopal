import { Decimal } from "@prisma/client/runtime/library";

export interface UpdateOrganization {
  companyName?: string;
  organizationNumber?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  wallet?: Decimal;
  email?: string;
  phone?: string;
}

export interface OrgBalanceWithEmployeesWalletInterface {
  companyBalance: Decimal;
  employees: {
    userId: string;
    userName: string | null;
    walletBalance: Decimal;
  }[];
}
