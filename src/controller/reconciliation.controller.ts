import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods } from "@/functions/function";
import { FilterReconciliationListInterface } from "@/interfaces/reconciliation";
import { decrypt } from "@/utils/AES";

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
      const {
        reconciliationStartTime,
        reconciliationEndTime,
        userId,
        page,
        limit,
      } = req.query;

      const pageNumber = !isNaN(Number(page))
        ? parseInt(page as string, 10)
        : 1;
      const pageSize = !isNaN(Number(limit))
        ? parseInt(limit as string, 10)
        : 10;

      const filters: FilterReconciliationListInterface = {
        reconciliationStartTime: reconciliationStartTime as string | undefined,
        reconciliationEndTime: reconciliationEndTime as string | undefined,
        organizationId: organizationId as string,
        userId: userId as string | undefined,
      };

      let reconciliation = await this.serviceFactory
        .getReconciliationHistoryService()
        .getReconciliationList(filters, pageNumber, pageSize);

      const decryptedReconciliations = reconciliation.reconciliations.map(
        (reconciliation) => {
          if (reconciliation.user) {
            const user = {
              ...reconciliation.user,
              email: reconciliation.user.email
                ? decrypt(reconciliation.user.email)
                : null,
              phone: reconciliation.user.phone
                ? decrypt(reconciliation.user.phone)
                : null,
            };
            return {
              ...reconciliation,
              user,
            };
          }
          return reconciliation;
        }
      );

      return OK(
        res,
        { ...reconciliation, reconciliations: decryptedReconciliations },
        "Reconciliation fetched successfully"
      );
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

      let decryptedReconciliations: Record<string, any> = {
        ...reconciliation,
      };
      if (reconciliation.user) {
        const user = {
          ...reconciliation.user,
          email: reconciliation.user.email
            ? decrypt(reconciliation.user.email)
            : null,
          phone: reconciliation.user.phone
            ? decrypt(reconciliation.user.phone)
            : null,
        };
        decryptedReconciliations = {
          ...reconciliation,
          user,
        };
      }

      if (reconciliation.reconciliator) {
        const reconciliator = {
          ...reconciliation.reconciliator,
          email: reconciliation.reconciliator.email
            ? decrypt(reconciliation.reconciliator.email)
            : null,
          phone: reconciliation.reconciliator.phone
            ? decrypt(reconciliation.reconciliator.phone)
            : null,
        };
        decryptedReconciliations = {
          ...reconciliation,
          reconciliator,
        };
      }

      return OK(
        res,
        decryptedReconciliations,
        "Reconciliation retrieved successfully"
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
  async getReconciliationReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return ERROR(res, false, "Invalid or missing reconciliation ID");
      }

      const reconciliation = await this.serviceFactory
        .getReconciliationHistoryService()
        .getReconciliationReceipt(Number(id));

      if (!reconciliation) {
        return ERROR(res, false, "Reconciliation not found");
      }

      if (!reconciliation.reconciliation) {
        return ERROR(res, false, "Reconciliation not found");
      }

      return OK(res, reconciliation, "Reconciliation retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
