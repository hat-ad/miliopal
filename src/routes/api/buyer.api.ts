import express from "express";
import BuyerController from "@/controller/buyer.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreateBuyer } from "../validators/buyer/createBuyer.validator";

const router = express.Router();

router.post(
  "/create-buyer",
  isAuthenticated,
  validateCreateBuyer,
  BuyerController.createBuyer
);

router.get("/get-buyer/:id", isAuthenticated, BuyerController.getBuyer);

router.get("/get-buyers-list", isAuthenticated, BuyerController.getBuyersList);

router.put("/update-buyer/:id", isAuthenticated, BuyerController.updateBuyer);

router.put("/delete-buyer/:id", isAuthenticated, BuyerController.deleteBuyer);

export default router;
