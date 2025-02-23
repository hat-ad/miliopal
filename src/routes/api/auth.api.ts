import express from "express";

import { validateLogin } from "../validators/auth/login.validator";
import AuthController from "@/controller/auth.controller";

const router = express.Router();

router.post("/login", validateLogin, AuthController.login);

export default router;
