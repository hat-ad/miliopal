import express from "express";

import AuthController from "@/controller/auth.controller";
import { validateLogin } from "../validators/auth/login.validator";

const router = express.Router();

router.post("/login", validateLogin, AuthController.getInstance().login);

export default router;
