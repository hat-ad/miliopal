import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods } from "@/functions/function";
import { FilterReconciliationListInterface } from "@/interfaces/reconciliation";

import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class ReconciliationHistoryController {
  private static instance: ReconciliationHistoryController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(
    factory?: ServiceFactory
  ): ReconciliationHistoryController {
    if (!ReconciliationHistoryController.instance) {
      ReconciliationHistoryController.instance =
        new ReconciliationHistoryController(factory);
    }
    return ReconciliationHistoryController.instance;
  }
  async createReconciliation(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;
      const userId = req.payload?.id;

      let reconciliation = await this.serviceFactory
        .getReconciliationHistoryService()
        .createReconciliation({
          ...req.body,
          organizationId,
          reConciliatedBy: userId,
        });

      return OK(res, reconciliation, "Reconciliation created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getReconciliationList(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.payload?.organizationId;
      const { reconciliationStartTime, reconciliationEndTime, userId, page } =
        req.query;

      const pageNumber = !isNaN(Number(page))
        ? parseInt(page as string, 10)
        : 1;

      const filters: FilterReconciliationListInterface = {
        reconciliationStartTime: reconciliationStartTime as string | undefined,
        reconciliationEndTime: reconciliationEndTime as string | undefined,
        organizationId: organizationId as string,
        userId: userId as string | undefined,
      };

      let reconciliation = await this.serviceFactory
        .getReconciliationHistoryService()
        .getReconciliationList(filters, pageNumber);

      return OK(res, reconciliation, "Reconciliation fetched successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
  async getReconciliation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return ERROR(res, false, "Invalid or missing reconciliation ID");
      }

      const reconciliation = await this.serviceFactory
        .getReconciliationHistoryService()
        .getReconciliation(Number(id));

      if (!reconciliation) {
        return ERROR(res, false, "Reconciliation not found");
      }

      return OK(res, reconciliation, "Reconciliation retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
