import { OK, ERROR } from "@/utils/response-helper";
import { Request, Response } from "express";
import AuthService from "@/services/auth.service";
import { generateToken } from "@/functions/function";
import { decrypt, encrypt } from "@/utils/AES";

export default class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const encryptedEmail = encrypt(email);

      let user = await AuthService.login(encryptedEmail, password);
      if (!user) return ERROR(res, false, "User not found");

      const token = generateToken(user?.id.toString());

      user = await AuthService.updateUser(user.id, { token });

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        name: user?.name ? decrypt(user.name) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };

      return OK(res, responseUser, "Login successful");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
