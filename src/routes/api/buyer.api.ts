import express from "express";
import BuyerController from "@/controller/buyer.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreateBuyer } from "../validators/buyer/createBuyer.validator";
import { validateLogin } from "../validators/buyer/login.validator";

const router = express.Router();

router.post("/create-buyer", validateCreateBuyer, BuyerController.createBuyer);

router.put("/update-buyer/:id", BuyerController.updateBuyer);

router.post("/login", validateLogin, BuyerController.login);

router.get("/get-buyer/:id", isAuthenticated, BuyerController.getBuyer);

router.get("/get-buyers-list", isAuthenticated, BuyerController.getBuyersList);

router.put("/delete-buyer/:id", isAuthenticated, BuyerController.deleteBuyer);

export default router;
