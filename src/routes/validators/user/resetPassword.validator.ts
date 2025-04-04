import { ERROR } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const SendResetPasswordInputSchema = z.object({
  email: z.string().email(),
});

export type SendResetPasswordInput = z.infer<
  typeof SendResetPasswordInputSchema
>;

const OTPValidationInputSchema = z.object({
  userID: z.string().min(1, "User id is required!"),
  otp: z.string().min(6, "OTP is required!"),
});

export type OTPValidationInput = z.infer<typeof OTPValidationInputSchema>;

const ResetPasswordSchema = z.object({
  userID: z.string().min(1, "User id is required!"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().min(6, "OTP is required!"),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const validateSendResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const payload = { email };
    req.body = payload;

    SendResetPasswordInputSchema.parse(req.body);
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
export const validateOTPValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID, otp } = req.body;
    const payload = { userID, otp };
    req.body = payload;

    OTPValidationInputSchema.parse(req.body);
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
export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userID, password, otp } = req.body;
    const payload = { userID, password, otp };
    req.body = payload;

    ResetPasswordSchema.parse(req.body);
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
