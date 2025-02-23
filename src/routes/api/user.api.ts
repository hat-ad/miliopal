import express from "express";
import UserController from "@/controller/user.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreateUser } from "../validators/user/createUser.validator";

const router = express.Router();

router.post("/create-user", validateCreateUser, UserController.createUser);

router.put("/update-user/:id", UserController.updateUser);

router.get("/get-user", isAuthenticated, UserController.getUser);

router.get("/get-users-list", isAuthenticated, UserController.getUsersList);

router.put("/delete-user/:id", isAuthenticated, UserController.deleteUser);

export default router;
