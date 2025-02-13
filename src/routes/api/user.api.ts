import express from "express";
import UserController from "@/controller/user.controller";

const router = express.Router();

router.get("/create-user", UserController.createUser);
router.get("/get-user/:id", UserController.getUser);
router.post("/login", UserController.loginUser);

export default router;
