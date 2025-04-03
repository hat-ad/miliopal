import {
  CreateReconciliationHistoryInterface,
  FilterReconciliationListInterface,
} from "@/interfaces/reconciliation";
import { ReconciliationHistory } from "@prisma/client";
import BaseRepository from "./base.repository";

class ReconciliationHistoryRepository extends BaseRepository {
  async createReconciliation(
    data: CreateReconciliationHistoryInterface
  ): Promise<any> {
    const reconciliation = await this.db.reconciliationHistory.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        reConciliatedBy: data.reConciliatedBy,
        expectedAmount: data.expectedAmount,
        amountCounted: data.amountCounted,
        comment: data.comment,
        reconciliationStartTime: new Date(
          data.reconciliationStartTime
        ).toISOString(),
        reconciliationEndTime: new Date(
          data.reconciliationEndTime
        ).toISOString(),
      },
    });

    return {
      ...reconciliation,
      id: reconciliation.id.toString(),
    };
  }

  async getReconciliationList(
    filters: FilterReconciliationListInterface,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reconciliations: ReconciliationHistory[];
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const whereCondition: any = {
      organizationId: filters.organizationId
        ? { equals: filters.organizationId }
        : undefined,
      userId: filters.userId ? { equals: filters.userId } : undefined,
      reconciliationStartTime: filters.reconciliationStartTime
        ? { gte: new Date(filters.reconciliationStartTime) }
        : undefined,
      reconciliationEndTime: filters.reconciliationEndTime
        ? { lte: new Date(filters.reconciliationEndTime) }
        : undefined,
    };

    const total = await this.db.reconciliationHistory.count({
      where: whereCondition,
    });

    const reconciliations = await this.db.reconciliationHistory.findMany({
      where: whereCondition,
      take: limit,
      skip: offset,
      include: {
        organization: true,
        user: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    const sanitizedReconciliations = JSON.parse(
      JSON.stringify(reconciliations, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return { reconciliations: sanitizedReconciliations, total, totalPages };
  }
  async getReconciliation(id: number): Promise<ReconciliationHistory | null> {
    const reconciliation = await this.db.reconciliationHistory.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        organization: true,
        user: true,
        reconciliator: true,
      },
    });

    if (!reconciliation) return null;

    return JSON.parse(
      JSON.stringify(reconciliation, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
  }
}

export default ReconciliationHistoryRepository;
