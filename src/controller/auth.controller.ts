import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods, generateToken } from "@/functions/function";
import { decrypt, encrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class AuthController {
  private static instance: AuthController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController(factory);
    }
    return AuthController.instance;
  }
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const encryptedEmail = encrypt(email);

      let user = await this.serviceFactory
        .getAuthService()
        .login(encryptedEmail, password);
      if (!user) return ERROR(res, false, "User not found");

      const token = generateToken(user?.id.toString());

      user = await this.serviceFactory
        .getAuthService()
        .updateUser(user.id, { token });

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };

      return OK(res, responseUser, "Login successful");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
