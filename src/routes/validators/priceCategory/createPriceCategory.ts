import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateCategorySchema = z.object({
  names: z
    .array(z.string().min(1, "Name is required"))
    .min(1, "At least one name is required"),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const validateCreatePriceCategory = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    CreateCategorySchema.parse(req.body);
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
