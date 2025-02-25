import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const createProductPurchaseSchema = z.object({
  productId: z.string().min(1, "Product id is required!"),
});

export type CreateUserInput = z.infer<typeof createProductPurchaseSchema>;

export const validateCreateProductPurchase = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createProductPurchaseSchema.parse(req.body);
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
