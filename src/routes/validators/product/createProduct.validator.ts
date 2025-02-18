import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(2, "price must be 2 digits"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const validateCreateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    CreateProductSchema.parse(req.body);
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
