import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateSellerSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.enum(["PRIVATE", "BUSINESS"], {
    invalid_type_error: "Invalid seller type",
  }),
});

export type CreateSellerInput = z.infer<typeof CreateSellerSchema>;

export const validateCreateSeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    CreateSellerSchema.parse(req.body);
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
