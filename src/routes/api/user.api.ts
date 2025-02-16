import express from "express";
import UserController from "@/controller/user.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateRegister } from "../validators/auth/register.validator";
import { validateLogin } from "../validators/auth/login.validator";

const router = express.Router();

router.post("/create-user", validateRegister, UserController.createUser);
router.post("/login", validateLogin, UserController.loginUser);
router.get("/get-user/:id", isAuthenticated, UserController.getUser);

export default router;
