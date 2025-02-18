import express from "express";
import ProductController from "@/controller/product.controller";
import { validateCreateSeller } from "../validators/seller/createSeller.validator";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreateProduct } from "../validators/product/createProduct.validator";

const router = express.Router();

router.post(
  "/create-product",
  isAuthenticated,
  validateCreateProduct,
  ProductController.createProduct
);

router.get(
  "/get-products-list",
  isAuthenticated,
  ProductController.getProductsList
);

router.put(
  "/update-product/:id",
  isAuthenticated,
  ProductController.updateProduct
);

router.put(
  "/delete-product/:id",
  isAuthenticated,
  ProductController.deleteProduct
);

export default router;
