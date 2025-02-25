import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const createPurchaseSchema = z.object({
  sellerId: z.string().min(1, "Seller id is required!"),
});

export type CreateUserInput = z.infer<typeof createPurchaseSchema>;

export const validateCreatePurchase = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createPurchaseSchema.parse(req.body);
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
