import { generateOTP } from "@/functions/function";
import OrganizationService from "@/services/organization.service";
import UserService from "@/services/user.service";
import { sendResetPasswordMail, sendWelcomeMail } from "@/templates/email";
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
      if (user && user.organizationId === organizationId)
        return ERROR(res, false, "User already exist");

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

      await sendWelcomeMail(user.id, email, responseUser.name || "");

      return OK(res, responseUser, "User invited successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userID, password } = req.body;

      const existingUser = await UserService.getUser(userID);

      if (!existingUser) {
        throw new Error("User not found");
      }

      if (existingUser?.isActive) {
        throw new Error("User is already active");
      }

      const user = await UserService.updateUser(existingUser.id, {
        password,
        isActive: true,
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

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.payload?.id;
      const { name, phone } = req.body;

      if (name) {
        req.body.name = encrypt(name);
      }
      if (phone) {
        req.body.phone = encrypt(phone);
      }

      if (!userId) return ERROR(res, false, "Unauthorized: User ID is missing");

      const existingUser = await UserService.getUser(userId);

      if (!existingUser) {
        throw new Error("User not found");
      }

      const user = await UserService.updateUser(userId, {
        ...req.body,
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

  static async sendResetPasswordEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const encryptedEmail = encrypt(email);
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const user = await UserService.getUserByEmail(encryptedEmail);
      if (!user) {
        return ERROR(res, false, "User not found");
      }

      await UserService.sendResetPasswordEmail(user.id, otp, otpExpiry);

      await sendResetPasswordMail(user.id, email, otp);
      return OK(res, null, "Email sent successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async isOTPValid(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const encryptedEmail = encrypt(email);
      const user = await UserService.getUserByEmail(encryptedEmail);
      if (!user) {
        return ERROR(res, false, "User not found");
      }

      const isOTPValid = await UserService.isOTPValid(user.id, otp);
      if (!isOTPValid) {
        return ERROR(res, false, "Invalid OTP");
      }

      return OK(res, isOTPValid, "Link is valid!");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, password } = req.body;

      const encryptedEmail = encrypt(email);
      const user = await UserService.getUserByEmail(encryptedEmail);
      if (!user) {
        return ERROR(res, false, "User not found");
      }

      const isOTPValid = await UserService.isOTPValid(user.id, otp);
      if (!isOTPValid) {
        return ERROR(res, false, "Invalid OTP");
      }

      await UserService.resetPassword(user.id, password);

      return OK(res, isOTPValid, "Password reset successful");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
