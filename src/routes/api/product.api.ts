import ProductController from "@/controller/product.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import { validateCreateProduct } from "../validators/product/createProduct.validator";

const router = express.Router();

router.post(
  "/create-product",
  isAuthenticated,
  validateCreateProduct,
  ProductController.getInstance().createProduct
);

router.get(
  "/get-products-list",
  isAuthenticated,
  ProductController.getInstance().getProductsList
);

router.put(
  "/update-product/:id",
  isAuthenticated,
  ProductController.getInstance().updateProduct
);

router.put(
  "/delete-product/:id",
  isAuthenticated,
  ProductController.getInstance().deleteProduct
);

export default router;
