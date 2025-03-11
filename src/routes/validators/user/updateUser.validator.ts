import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const UpdateUserSchema = z.object({
  phone: z.string().min(10, "Phone number is required!").optional(),
  name: z.string().min(1, "Name is required!").optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, name, isArchived, isDeleted, isActive } = req.body;
    const payload = { isArchived, isDeleted, isActive, phone, name };
    req.body = payload;

    UpdateUserSchema.parse(req.body);
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
