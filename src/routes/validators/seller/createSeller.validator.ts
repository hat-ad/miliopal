import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateSellerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone Number must be 10 digits"),
  address: z.string().min(1, "Address is required"),
  postalCode: z.string().min(4, "postalCode is required"),
  city: z.string().min(4, "City is required"),
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
