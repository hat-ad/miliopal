import { OK, ERROR, BAD } from "@/utils/response-helper";
import { Request, Response } from "express";
import AuthService from "@/services/auth.service";
import { generateToken } from "@/functions/function";

export default class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      if (!user) return ERROR(res, false, "User not found");

      const token = generateToken(user?.id.toString());

      const response = await AuthService.updateUser(user.id, { token });
      return OK(res, response, "Login successful");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
