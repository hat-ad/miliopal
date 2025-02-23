import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserTokenPayload } from "@/types/interface";
import { ERROR, UNAUTHORIZED } from "@/utils/response-helper";
import { Role } from "@/types/enums";
import BuyerService from "@/services/buyer.service";

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

    const buyer = await BuyerService.getBuyer(payload.sub);
    if (!buyer) return ERROR(res, null, "Buyer does not exist");

    const buyerPayload: UserTokenPayload = {
      id: payload.sub,
      role: buyer.role as Role,
      email: buyer.email,
    };

    console.log("Authenticated User:", buyerPayload);

    req.payload = buyerPayload;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return UNAUTHORIZED(res, [], "Token Not Verified");
  }
};
