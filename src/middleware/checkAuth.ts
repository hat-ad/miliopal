import { ServiceFactorySingleton } from "@/factory/service.factory";
import { UserTokenPayload } from "@/types/common";
import { Role } from "@/types/enums";
import { ERROR, UNAUTHORIZED } from "@/utils/response-helper";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ERROR(res, null, "No token found");
    }

    const secretKey = process.env.SECRET as string;
    if (!secretKey) {
      return ERROR(res, null, "JWT Secret is missing");
    }

    const payload = jwt.verify(token, secretKey) as jwt.JwtPayload;

    if (!payload.sub) {
      return ERROR(res, null, "Invalid token");
    }

    const factory = ServiceFactorySingleton.getInstance();

    const user = await factory.getUserService().getUser(payload.sub);
    if (!user) return ERROR(res, null, "User does not exist");

    if (user.isArchived) {
      return ERROR(res, false, "Your account is marked as in active!");
    }

    const userPayload: UserTokenPayload = {
      id: payload.sub,
      role: user.role as Role,
      email: user.email,
      organizationId: user.organizationId,
    };

    req.payload = userPayload;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return UNAUTHORIZED(res, [], "Token Not Verified");
  }
};
