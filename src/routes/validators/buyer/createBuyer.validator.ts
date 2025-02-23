import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateBuyerSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type CreateBuyerInput = z.infer<typeof CreateBuyerSchema>;

export const validateCreateBuyer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    CreateBuyerSchema.parse(req.body);
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
