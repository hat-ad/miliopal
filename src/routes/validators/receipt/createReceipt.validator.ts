import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateReceiptSchema = z.object({
  startingOrderNumber: z.number().min(1, "startingOrderNumber is required!"),
  currentOrderNumber: z.number().min(1, "currentOrderNumber is required!"),
  logo: z.string().min(1, "logo is required!"),
});

export type CreateReceiptInput = z.infer<typeof CreateReceiptSchema>;

export const validateCreateReceipt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startingOrderNumber, currentOrderNumber, logo } = req.body;
    const payload = { startingOrderNumber, currentOrderNumber, logo };
    req.body = payload;

    CreateReceiptSchema.parse(req.body);
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
