export interface CreateReconciliationHistoryInterface {
  organizationId: string;
  userId: string;
  reConciliatedBy: string;
  expectedAmount: number;
  amountCounted: number;
  comment: string;
  reconciliationStartTime: string;
  reconciliationEndTime: string;
}

export interface FilterReconciliationListInterface {
  organizationId: string;
  userId?: string;
  reconciliationStartTime?: string;
  reconciliationEndTime?: string;
}
