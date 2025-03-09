import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  organizationNumber: z.string().min(1, "Organization number is required!"),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, organizationNumber } = req.body;
    const payload = { email, organizationNumber };
    req.body = payload;

    CreateUserSchema.parse(req.body);
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
