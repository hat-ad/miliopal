import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import PriceCategoryController from "@/controller/price-category.controller";
import { validateCreatePriceCategory } from "../validators/priceCategory/createPriceCategory";

const router = express.Router();

router.post(
  "/create-bulk-price-categories",
  validateCreatePriceCategory,
  isAuthenticated,
  PriceCategoryController.getInstance().createBulkPriceCategory
);

router.get(
  "/get-price-category-lists",
  isAuthenticated,
  PriceCategoryController.getInstance().getPriceCategoryList
);

export default router;
