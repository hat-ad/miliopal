import { OK, ERROR } from "@/utils/response-helper";
import { Request, Response } from "express";
import UserService from "@/services/user.service";
import { generateToken } from "@/functions/function";

export default class UserController {
  static async createUserInternal(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      let user = await UserService.getUserByEmail(email);
      if (user) return ERROR(res, false, "User already exist");

      user = await UserService.createUserInternal(req.body);
      return OK(res, user, "User created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      let user = await UserService.getUserByEmail(email);
      if (user) return ERROR(res, false, "User already exist");

      user = await UserService.createUser(req.body);
      return OK(res, user, "User created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const token = generateToken(id.toString());
      const existingUser = await UserService.getUser(id);

      if (!existingUser) {
        throw new Error("User not found");
      }

      const user = await UserService.updateUser(id, { ...req.body, token });
      return OK(res, user, "User updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.query;
      if (id) {
        const user = await UserService.getUser(id as string);
        return OK(res, user, "User retrieved successfully");
      } else {
        const userID = req.payload?.id;
        const user = await UserService.getUser(userID as string);
        return OK(res, user, "User retrieved successfully");
      }
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getUsersList(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, isActive, isArchived, sortOrder, page } =
        req.query;

      const filters = {
        name: name as string,
        email: email as string,
        phone: phone as string,
        isActive: isActive ? isActive === "true" : undefined,
        isArchived: isArchived ? isArchived === "true" : undefined,
      };

      const pageNumber = page ? parseInt(page as string, 10) : 1;

      const sortedBy = "name";
      const sortedOrder = (sortOrder === "desc" ? "desc" : "asc") as
        | "asc"
        | "desc";

      const users = await UserService.getUsersList(
        filters,
        sortedBy,
        sortedOrder,
        pageNumber
      );
      return OK(res, users, "Users retrieved successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.deleteUser(id);
      return OK(res, user, "User deleted successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getUserSellingHistory(req: Request, res: Response) {
    try {
      const userId = req.payload?.id;

      if (!userId) {
        return ERROR(res, null, "Unauthorized: No user ID in token");
      }

      const userSellingHistory = await UserService.getUserSellingHistory(
        userId
      );
      return OK(
        res,
        userSellingHistory,
        "User selling history retrived successfully"
      );
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
