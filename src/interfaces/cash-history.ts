import { AccountType, CashHistoryType } from "@prisma/client";

export interface CreateCashHistoryInterface {
  organizationId: string;
  userId: string;
  amount: number;
  note?: string;
  type: CashHistoryType;
  accountType: AccountType;
  date: string;
}
