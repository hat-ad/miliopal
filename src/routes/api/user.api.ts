import UserController from "@/controller/user.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import { validateActivateUser } from "../validators/user/activateUser.validator";
import { validateCreateUser } from "../validators/user/createUser.validator";
import { validateInviteUser } from "../validators/user/inviteUser.validator";
import {
  validateOTPValidation,
  validateResetPassword,
  validateSendResetPassword,
} from "../validators/user/resetPassword.validator";
import { validateUpdateUser } from "../validators/user/updateUser.validator";

const router = express.Router();

router.post(
  "/create-user-internal",
  validateCreateUser,
  UserController.getInstance().createUserInternal
);

router.post(
  "/create-user",
  validateInviteUser,
  isAuthenticated,
  UserController.getInstance().inviteUser
);

router.put(
  "/activate-user",
  validateActivateUser,
  UserController.getInstance().activateUser
);
router.put(
  "/update-user",
  isAuthenticated,
  validateUpdateUser,
  UserController.getInstance().updateUser
);

router.get("/get-user", isAuthenticated, UserController.getInstance().getUser);

router.get(
  "/get-users-list",
  isAuthenticated,
  UserController.getInstance().getUsersList
);

router.put(
  "/delete-user/:id",
  isAuthenticated,
  UserController.getInstance().deleteUser
);

router.get(
  "/get-user-selling-history",
  isAuthenticated,
  UserController.getInstance().getUserSellingHistory
);

router.post(
  "/send-reset-password-link",
  validateSendResetPassword,
  UserController.getInstance().sendResetPasswordEmail
);

router.post(
  "/validate-reset-password-link",
  validateOTPValidation,
  UserController.getInstance().isOTPValid
);

router.post(
  "/reset-password",
  validateResetPassword,
  UserController.getInstance().resetPassword
);
export default router;
