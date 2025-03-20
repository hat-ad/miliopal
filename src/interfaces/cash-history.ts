import { AccountType, CashHistoryType } from "@prisma/client";

export interface CreateCashHistoryInterface {
  organizationId: string;
  actionBy: string;
  actionTo: string;
  amount: number;
  note?: string;
  type: CashHistoryType;
  accountType: AccountType;
  date: string;
}
