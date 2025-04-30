import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const createPickupDeliverySchema = z.object({
  sellerId: z.string().min(1, "Seller id is required!"),
  PONumber: z.string().min(1, "PO number is not valid").optional(),
  comment: z.string().min(4, "Comment is invalid!").optional(),
  priceCategoryId: z.string().min(1, "Price category id is required!"),
});

export type CreatePickupDeliveryInput = z.infer<
  typeof createPickupDeliverySchema
>;

export const validateCreatePickupDelivery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createPickupDeliverySchema.parse(req.body);
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
