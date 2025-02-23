import express from "express";

import userApi from "@/routes/api/user.api";
import sellerApi from "@/routes/api/seller.api";
import productApi from "@/routes/api/product.api";
import authApi from "@/routes/api/auth.api";
const router = express.Router();

router.use("/user", userApi);
router.use("/seller", sellerApi);
router.use("/product", productApi);
router.use("/auth", authApi);

export default router;
