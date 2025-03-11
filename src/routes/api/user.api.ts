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
  UserController.createUserInternal
);

router.post(
  "/create-user",
  validateInviteUser,
  isAuthenticated,
  UserController.inviteUser
);

router.put("/activate-user", validateActivateUser, UserController.activateUser);
router.put(
  "/update-user",
  isAuthenticated,
  validateUpdateUser,
  UserController.updateUser
);

router.get("/get-user", isAuthenticated, UserController.getUser);

router.get("/get-users-list", isAuthenticated, UserController.getUsersList);

router.put("/delete-user/:id", isAuthenticated, UserController.deleteUser);

router.get(
  "/get-user-selling-history",
  isAuthenticated,
  UserController.getUserSellingHistory
);

router.post(
  "/send-reset-password-link",
  isAuthenticated,
  validateSendResetPassword,
  UserController.sendResetPasswordEmail
);

router.post(
  "/validate-reset-password-link",
  validateOTPValidation,
  UserController.isOTPValid
);

router.post(
  "/reset-password",
  validateResetPassword,
  UserController.resetPassword
);
export default router;
