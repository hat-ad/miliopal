import { ServiceFactory } from "@/factory/service.factory";
import { bindMethods, generateOTP } from "@/functions/function";

import { sendResetPasswordMail, sendWelcomeMail } from "@/templates/email";
import { decrypt, encrypt } from "@/utils/AES";
import { ERROR, OK } from "@/utils/response-helper";
import { PaymentMethod, Role } from "@prisma/client";
import { Request, Response } from "express";

export default class UserController {
  private static instance: UserController;
  private serviceFactory: ServiceFactory;

  private constructor(factory?: ServiceFactory) {
    this.serviceFactory = factory ?? new ServiceFactory();
    bindMethods(this);
  }

  static getInstance(factory?: ServiceFactory): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController(factory);
    }
    return UserController.instance;
  }
  async createUserInternal(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, organizationNumber, phone, name } = req.body;
      const encryptedEmail = encrypt(email);
      const encryptedPhone = encrypt(phone);

      let user = await this.serviceFactory
        .getUserService()
        .getUserByEmail(encryptedEmail);
      if (user) return ERROR(res, false, "User already exist");

      let org = await this.serviceFactory
        .getOrganizationService()
        .getOrganizationByNumber(organizationNumber);
      if (org) {
        return ERROR(res, false, "Organization already exist");
      }

      user = await this.serviceFactory.getUserService().createUserInternal({
        email: encryptedEmail,
        organizationNumber: organizationNumber,
        password,
        phone: encryptedPhone,
        name,
        isActive: true,
      });

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };

      return OK(res, responseUser, "User created successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async inviteUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;
      const organizationId = req.payload?.organizationId;

      if (!organizationId)
        return ERROR(res, false, "Unauthorized: Organization ID is missing");

      const encryptedEmail = encrypt(email);

      let user = await this.serviceFactory
        .getUserService()
        .getUserByEmail(encryptedEmail);
      if (user && user.isActive) return ERROR(res, false, "User already exist");

      const isUserPresent = Boolean(user);

      if (!isUserPresent) {
        user = await this.serviceFactory.getUserService().inviteUser({
          ...req.body,
          email: encryptedEmail,
          name,
          organizationId,
          isActive: false,
        });
      }

      if (!user) return ERROR(res, false, "user not created");
      const organization = await this.serviceFactory
        .getOrganizationService()
        .getOrganizationById(organizationId);

      if (!organization) return ERROR(res, false, "Organization not found");

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };

      await sendWelcomeMail(
        user.id,
        email,
        responseUser.name || "",
        organization
      );

      return OK(res, responseUser, "User invited successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userID, password } = req.body;

      const existingUser = await this.serviceFactory
        .getUserService()
        .getUser(userID);

      if (!existingUser) {
        throw new Error("User not found");
      }

      if (existingUser?.isActive) {
        throw new Error("User is already active");
      }

      const user = await this.serviceFactory
        .getUserService()
        .updateUser(existingUser.id, {
          password,
          isActive: true,
        });
      if (!user) return ERROR(res, false, "User not updated!");

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };
      return OK(res, responseUser, "User updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      let userId = req.payload?.id;
      const { id } = req.query;
      const { phone } = req.body;

      if (id) {
        userId = id as string;
      }

      if (phone) {
        req.body.phone = encrypt(phone);
      }

      if (!userId) return ERROR(res, false, "Unauthorized: User ID is missing");

      const existingUser = await this.serviceFactory
        .getUserService()
        .getUser(userId);

      if (!existingUser) {
        throw new Error("User not found");
      }

      const actionByUser = await this.serviceFactory
        .getUserService()
        .getUser(req.payload?.id as string);

      if (!actionByUser) {
        throw new Error("User not found");
      }

      if (
        actionByUser?.role !== Role.ADMIN &&
        actionByUser?.role !== Role.SUPERADMIN
      ) {
        throw new Error("You are not authorized to update this user");
      }

      const user = await this.serviceFactory
        .getUserService()
        .updateUser(userId, {
          ...req.body,
        });
      if (!user) return ERROR(res, false, "User not updated!");

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };
      return OK(res, responseUser, "User updated successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.query;
      if (id) {
        const user = await this.serviceFactory
          .getUserService()
          .getUser(id as string);
        const responseUser = {
          ...user,
          email: user?.email ? decrypt(user.email) : null,
          phone: user?.phone ? decrypt(user.phone) : null,
        };
        return OK(res, responseUser, "User retrieved successfully");
      } else {
        const userID = req.payload?.id;
        const user = await this.serviceFactory
          .getUserService()
          .getUser(userID as string);
        if (!user) return ERROR(res, false, "User not found!");

        const responseUser = {
          ...user,
          email: user?.email ? decrypt(user.email) : null,
          phone: user?.phone ? decrypt(user.phone) : null,
        };

        return OK(res, responseUser, "User retrieved successfully");
      }
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getUsersList(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, isActive, isArchived, sortOrder, page } =
        req.query;
      const organizationId = req.payload?.organizationId;

      const encryptedEmail = email ? encrypt(email as string) : undefined;
      const encryptedPhone = phone ? encrypt(phone as string) : undefined;

      const filters = {
        ...(name && { name: name as string }),
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

      const { users, total, totalPages } = await this.serviceFactory
        .getUserService()
        .getUsersList(filters, sortedBy, sortedOrder, pageNumber);

      const responseUsers = users.map((user) => ({
        ...user,
        email: user.email ? decrypt(user.email) : null,
        phone: user.phone ? decrypt(user.phone) : null,
      }));

      return OK(
        res,
        { users: responseUsers, total, totalPages },
        "Users retrieved successfully"
      );
    } catch (error) {
      console.log(error);
      return ERROR(res, false, "An error occurred while retrieving users");
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.serviceFactory.getUserService().deleteUser(id);
      if (!user) return ERROR(res, false, "User not deleted!");

      const responseUser = {
        ...user,
        email: user?.email ? decrypt(user.email) : null,
        phone: user?.phone ? decrypt(user.phone) : null,
      };

      return OK(res, responseUser, "User deleted successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async getUserSellingHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page, limit, from, to, paymentMethod } = req.query;
      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const pageSize = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        paymentMethod: paymentMethod
          ? (paymentMethod as PaymentMethod)
          : undefined,
        from: from ? new Date(from as string).toISOString() : undefined,
        to: to ? new Date(to as string).toISOString() : undefined,
      };

      const userSellingHistory = await this.serviceFactory
        .getUserService()
        .getUserSellingHistory(userId, pageNumber, pageSize, filters);

      const decryptedPurchase = userSellingHistory?.purchase.map(
        (purchase) => ({
          ...purchase,
          user: purchase?.user
            ? {
                ...purchase?.user,
                email: purchase?.user.email
                  ? decrypt(purchase.user.email)
                  : null,
                phone: purchase?.user.phone
                  ? decrypt(purchase.user.phone)
                  : null,
              }
            : null,
        })
      );

      const response = {
        buyer: {
          ...userSellingHistory?.buyer,
          email: userSellingHistory?.buyer?.email
            ? decrypt(userSellingHistory.buyer.email)
            : null,

          phone: userSellingHistory?.buyer?.phone
            ? decrypt(userSellingHistory.buyer.phone)
            : null,
        },
        purchase: decryptedPurchase,
        total: userSellingHistory?.total,
        totalPages: userSellingHistory?.totalPages,
      };
      return OK(res, response, "User selling history retrived successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async sendResetPasswordEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const encryptedEmail = encrypt(email);
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const user = await this.serviceFactory
        .getUserService()
        .getUserByEmail(encryptedEmail);
      if (!user) {
        return ERROR(res, false, "User not found");
      }

      const organization = await this.serviceFactory
        .getOrganizationService()
        .getOrganizationById(user.organizationId);

      if (!organization) {
        return ERROR(res, false, "Organization not found");
      }

      await this.serviceFactory
        .getUserService()
        .sendResetPasswordEmail(user.id, otp, otpExpiry);

      await sendResetPasswordMail(user.id, email, otp, organization);
      return OK(res, null, "Email sent successfully");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async isOTPValid(req: Request, res: Response) {
    try {
      const { userID, otp } = req.body;

      const user = await this.serviceFactory.getUserService().getUser(userID);
      if (!user) {
        return ERROR(res, false, "User not found");
      }

      const isOTPValid = await this.serviceFactory
        .getUserService()
        .isOTPValid(user.id, otp);
      if (!isOTPValid) {
        return ERROR(res, false, "Invalid OTP");
      }

      return OK(res, isOTPValid, "Link is valid!");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { userID, otp, password } = req.body;

      const user = await this.serviceFactory.getUserService().getUser(userID);
      if (!user) {
        return ERROR(res, false, "User not found");
      }

      const isOTPValid = await this.serviceFactory
        .getUserService()
        .isOTPValid(user.id, otp);
      if (!isOTPValid) {
        return ERROR(res, false, "Invalid OTP");
      }

      await this.serviceFactory
        .getUserService()
        .resetPassword(user.id, password);

      return OK(res, isOTPValid, "Password reset successful");
    } catch (error) {
      return ERROR(res, false, error);
    }
  }
}
