import express from "express";
import SellerController from "@/controller/seller.controller";
import { validateCreateSeller } from "../validators/seller/createSeller.validator";
import { isAuthenticated } from "@/middleware/checkAuth";

const router = express.Router();

router.post(
  "/create-seller",
  isAuthenticated,
  validateCreateSeller,
  SellerController.createSeller
);

router.get("/get-seller/:id", isAuthenticated, SellerController.getSeller);

router.get(
  "/get-sellers-list",
  isAuthenticated,
  SellerController.getSellersList
);

router.put(
  "/update-seller/:id",
  isAuthenticated,
  SellerController.updateSeller
);

router.put(
  "/delete-seller/:id",
  isAuthenticated,
  SellerController.deleteSeller
);

export default router;
