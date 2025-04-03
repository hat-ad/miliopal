import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const UpdateTodoListSettingsSchema = z.object({
  isCompanyCashBalanceLowerThresholdEnabled: z.boolean(),
  isIndividualCashBalanceLowerThresholdEnabled: z.boolean(),
  isPrivateSellerSalesBalanceUpperThresholdEnabled: z.boolean(),
  companyCashBalanceLowerThreshold: z
    .number()
    .min(0, "company cash balance lower threshold is required!")
    .optional(),
  individualCashBalanceLowerThreshold: z
    .number()
    .min(0, "individual cash balance lower threshold is required!")
    .optional(),
  privateSellerSalesBalanceUpperThreshold: z
    .number()
    .min(0, "private seller balance upper threshold is required!")
    .optional(),
});

export type updateTodoListSettingsSchema = z.infer<
  typeof UpdateTodoListSettingsSchema
>;

export const validateUpdateTodoListSettings = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = {
      companyCashBalanceLowerThreshold:
        req.body.companyCashBalanceLowerThreshold,
      individualCashBalanceLowerThreshold:
        req.body.individualCashBalanceLowerThreshold,
      privateSellerSalesBalanceUpperThreshold:
        req.body.privateSellerSalesBalanceUpperThreshold,
      isCompanyCashBalanceLowerThresholdEnabled:
        req.body.isCompanyCashBalanceLowerThresholdEnabled,
      isIndividualCashBalanceLowerThresholdEnabled:
        req.body.isIndividualCashBalanceLowerThresholdEnabled,
      isPrivateSellerSalesBalanceUpperThresholdEnabled:
        req.body.isPrivateSellerSalesBalanceUpperThresholdEnabled,
    };
    req.body = payload;
    UpdateTodoListSettingsSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return ERROR(
        res,
        error.errors.map((err) => ({
          message: err.message,
          path: err.path,
        })),
        "Validation error"
      );
    }
    return ERROR(res, [], "Internal Server Error");
  }
};
