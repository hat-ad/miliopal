import express from "express";
import UserController from "@/controller/user.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateInviteUser } from "../validators/user/inviteUser.validator";
import { validateCreateUser } from "../validators/user/createUser.validate";

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

router.put("/update-user", isAuthenticated, UserController.updateUser);

router.get("/get-user", isAuthenticated, UserController.getUser);

router.get("/get-users-list", isAuthenticated, UserController.getUsersList);

router.put("/delete-user/:id", isAuthenticated, UserController.deleteUser);

router.get(
  "/get-user-selling-history",
  isAuthenticated,
  UserController.getUserSellingHistory
);

export default router;
