import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateTransactionSchema = z.object({
  amount: z.number().min(1, "amount is required!"),
  note: z.string().optional(),
  date: z.string().min(4, "date is required!"),
  type: z.enum(["DEPOSITE", "WITHDRAW"], {
    invalid_type_error: "Invalid type",
  }),
  accountType: z.enum(["COMPANY", "INDIVIDUAL"], {
    invalid_type_error: "Invalid account type",
  }),
});

export type transactionInput = z.infer<typeof CreateTransactionSchema>;

export const validateCreateTransaction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    CreateTransactionSchema.parse(req.body);
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
