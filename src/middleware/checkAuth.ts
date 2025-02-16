import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserTokenPayload } from "@/types/interface";
import UserServices from "@/services/user.service";
import { ERROR, UNAUTHORIZED } from "@/utils/response-helper";
import { Role } from "@/types/enums";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      payload?: UserTokenPayload;
    }
  }
}

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
    console.log("Decoded Token Payload:", payload);

    if (!payload.sub) {
      return ERROR(res, null, "Invalid token");
    }

    const user = await UserServices.getUser(payload.sub);
    if (!user) return ERROR(res, null, "User does not exist");

    const userPayload: UserTokenPayload = {
      id: payload.sub,
      role: user.role as Role,
      email: user.email,
    };

    console.log("Authenticated User:", userPayload);

    req.payload = userPayload;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return UNAUTHORIZED(res, [], "Token Not Verified");
  }
};
