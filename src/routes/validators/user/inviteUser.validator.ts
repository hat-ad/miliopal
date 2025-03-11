import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const InviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string().min(3, "Role is required!"),
  name: z.string().min(3, "Name is required!"),
});

export type InviteUserInput = z.infer<typeof InviteUserSchema>;

export const validateInviteUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, role } = req.body;
    const payload = { email, name, role };
    req.body = payload;

    InviteUserSchema.parse(req.body);
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
