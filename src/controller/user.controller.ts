import { generateToken, sendMail } from "@/functions/function";
import OrganizationService from "@/services/organization.service";
import UserService from "@/services/user.service";
import { decrypt, encrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";
import { Request, Response } from "express";

export default class UserController {
  static async createUserInternal(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, organizationNumber, phone, name } = req.body;
      const encryptedEmail = encrypt(email);
      const encryptedName = encrypt(name);
      const encryptedPhone = encrypt(phone);

      let user = await UserService.getUserByEmail(encryptedEmail);
      if (user) return ERROR(res, false, "User already exist");

      let org = await OrganizationService.getOrganizationByNumber(
        organizationNumber
      );
      if (org) {
        return ERROR(res, false, "Organization already exist");
      }
      const newOrg = await OrganizationService.createOrganization({
        organizationNumber,
      });

      user = await UserService.createUserInternal({
        email: encryptedEmail,
        organizationId: newOrg.id,
        password,
        phone: encryptedPhone,
        name: encryptedName,
      });

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        name: user?.name ? decrypt(user.name) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };

      return OK(res, responseUser, "User created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async inviteUser(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const organizationId = req.payload?.organizationId;

      const encryptedEmail = encrypt(email);

      let user = await UserService.getUserByEmail(encryptedEmail);
      if (user) return ERROR(res, false, "User already exist");

      user = await UserService.createUser({
        ...req.body,
        email: encryptedEmail,
        organizationId,
      });

      if (!user) return ERROR(res, false, "user not created");

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        name: user?.name ? decrypt(user.name) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };
      const invitedUser = {
        email,
        subject: "You're Invited!",
        text: "Hello, you've been invited to join our platform.",
        html: "<p>Hello,</p><p>You've been invited to join our platform.</p>",
      };

      await sendMail(
        invitedUser.email,
        invitedUser.subject,
        invitedUser.text,
        invitedUser.html
      );
      return OK(res, responseUser, "User invited successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone } = req.body;

      const encryptedName = name ? encrypt(name) : null;
      const encryptedPhone = phone ? encrypt(phone) : null;

      const token = generateToken(id.toString());

      const existingUser = await UserService.getUser(id);

      if (!existingUser) {
        throw new Error("User not found");
      }

      const user = await UserService.updateUser(id, {
        ...req.body,
        name: encryptedName,
        phone: encryptedPhone,
        token,
      });
      if (!user) return ERROR(res, false, "User not updated!");

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        name: user?.name ? decrypt(user.name) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };
      return OK(res, responseUser, "User updated successfully");
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
        if (!user) return ERROR(res, false, "User not found!");

        const responseUser = {
          ...user,
          email: user?.email ? decrypt(user.email) : null,
          name: user?.name ? decrypt(user.name) : null,
          phone: user?.phone ? decrypt(user.phone) : null,
        };

        return OK(res, responseUser, "User retrieved successfully");
      }
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async getUsersList(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, isActive, isArchived, sortOrder, page } =
        req.query;
      const organizationId = req.payload?.organizationId;

      const encryptedEmail = email ? encrypt(email as string) : undefined;
      const encryptedName = name ? encrypt(name as string) : undefined;
      const encryptedPhone = phone ? encrypt(phone as string) : undefined;

      const filters = {
        ...(encryptedName && { name: encryptedName }),
        ...(encryptedEmail && { email: encryptedEmail }),
        ...(encryptedPhone && { phone: encryptedPhone }),
        ...(organizationId && { organizationId }),
        ...(isActive !== undefined && { isActive: isActive === "true" }),
        ...(isArchived !== undefined && { isArchived: isArchived === "true" }),
      };

      const sortedBy = "name";
      const sortedOrder: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";
      const pageNumber = !isNaN(Number(page))
        ? parseInt(page as string, 10)
        : 1;

      const { users, total, totalPages } = await UserService.getUsersList(
        filters,
        sortedBy,
        sortedOrder,
        pageNumber
      );

      const responseUsers = users.map((user) => ({
        ...user,
        name: user.name ? decrypt(user.name) : null,
        email: user.email ? decrypt(user.email) : null,
        phone: user.phone ? decrypt(user.phone) : null,
      }));

      return OK(
        res,
        { users: responseUsers, total, totalPages },
        "Users retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving users list:", error);
      return ERROR(res, false, "An error occurred while retrieving users");
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.deleteUser(id);
      if (!user) return ERROR(res, false, "User not deleted!");

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        name: user?.name ? decrypt(user.name) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };

      return OK(res, responseUser, "User deleted successfully");
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

      const response = {
        buyer: {
          ...userSellingHistory?.buyer,
          email: userSellingHistory?.buyer.email
            ? decrypt(userSellingHistory.buyer.email)
            : null,
          name: userSellingHistory?.buyer.name
            ? decrypt(userSellingHistory.buyer.name)
            : null,
          phone: userSellingHistory?.buyer.phone
            ? decrypt(userSellingHistory.buyer.phone)
            : null,
        },
        purchase: userSellingHistory?.purchase,
        organization: userSellingHistory?.organization,
      };
      return OK(res, response, "User selling history retrived successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
