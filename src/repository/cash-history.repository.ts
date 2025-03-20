import { CashHistory, AccountType, CashHistoryType } from "@prisma/client";
import BaseRepository from "./base.repository";
import { CreateCashHistoryInterface } from "@/interfaces/cash-history";

class CashHistoryRepository extends BaseRepository {
  async createCashHistory(
    data: CreateCashHistoryInterface
  ): Promise<CashHistory> {
    const formattedDate = new Date(data.date).toISOString();
    return this.db.cashHistory.create({
      data: {
        organizationId: data.organizationId,
        actionBy: data.actionBy,
        actionTo: data.actionTo,
        amount: data.amount,
        note: data.note,
        date: formattedDate,
        type: data.type ?? CashHistoryType.DEPOSIT,
        accountType: data.accountType ?? AccountType.INDIVIDUAL,
      },
    });
  }
}

export default CashHistoryRepository;
