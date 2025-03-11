import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const ActivateUserSchema = z.object({
  userID: z.string().min(1, "User id is required!"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ActivateUserInput = z.infer<typeof ActivateUserSchema>;

export const validateActivateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID, password } = req.body;
    const payload = { password, userID };
    req.body = payload;

    ActivateUserSchema.parse(req.body);
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
