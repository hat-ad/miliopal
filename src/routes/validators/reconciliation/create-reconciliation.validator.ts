import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateReconciliationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  expectedAmount: z.number(),
  amountCounted: z.number().min(0, "Amount counted must be a positive number"),
  comment: z.string().optional(),
  reconciliationStartTime: z.string().min(6, "Invalid date format"),
  reconciliationEndTime: z.string().min(5, "Invalid date format"),
});

export type CreateReconciliationInput = z.infer<
  typeof CreateReconciliationSchema
>;

export const validateCreateReconciliation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    CreateReconciliationSchema.parse(req.body);
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
