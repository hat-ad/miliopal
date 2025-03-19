export interface UpdateOrganization {
  companyName?: string;
  organizationNumber?: string;
  postalCode?: string;
  city?: string;
  address?: string;
  wallet?: number;
}

export interface OrgBalanceWithEmployeesWalletInterface {
  companyBalance: number;
  employees: {
    userId: string;
    userName: string | null;
    walletBalance: number;
  }[];
}
