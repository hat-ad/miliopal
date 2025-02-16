import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateBuyerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone Number must be 10 digits"),
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
