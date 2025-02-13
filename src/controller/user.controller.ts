import { OK, ERROR, BAD } from "@/utils/response-helper";
import { Request, Response } from "express";
import UserService from "@/services/user.service";

export default class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.createUser(req.body);
      return OK(res, user, "User created successfully");
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

  static async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await UserService.loginUser(email, password);
      return OK(res, user, "Login successful");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
