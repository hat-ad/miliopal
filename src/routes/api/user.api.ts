import express from "express";
import UserController from "@/controller/user.controller";
import { isAuthenticated } from "@/middleware/checkAuth";

const router = express.Router();

router.post("/create-user", UserController.createUser);
router.post("/login", UserController.loginUser);
router.get("/get-user/:id", isAuthenticated, UserController.getUser);

export default router;
