import { OK, ERROR, BAD } from "@/utils/response-helper";
import { Request, Response } from "express";
import UserService from "@/services/user.service";
import bcrypt from "bcryptjs";
import { generateToken } from "@/functions/function";

export default class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await UserService.createUser(req.body);

      const token = generateToken(newUser.id.toString());

      const response = await UserService.updateUser(newUser.id, { token });
      return OK(res, response, "User created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await UserService.loginUser(email, password);
      if (!user) return ERROR(res, false, "User not found");

      const token = generateToken(user?.id.toString());

      const response = await UserService.updateUser(user.id, { token });
      return OK(res, response, "Login successful");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUser(id);
      if (!user) {
        return ERROR(res, false, "User not found");
      }
      return OK(res, user, "User retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
