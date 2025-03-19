import { CashHistory, AccountType, CashHistoryType } from "@prisma/client";
import BaseRepository from "./base.repository";
import { CreateCashHistoryInterface } from "@/interfaces/cash-history";

class CashHistoryRepository extends BaseRepository {
  async createCashHistory(
    data: CreateCashHistoryInterface
  ): Promise<CashHistory> {
    return this.db.cashHistory.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        amount: data.amount,
        note: data.note,
        date: data.date,
        type: data.type ?? CashHistoryType.DEPOSIT,
        accountType: data.accountType ?? AccountType.INDIVIDUAL,
      },
    });
  }
}

export default CashHistoryRepository;
