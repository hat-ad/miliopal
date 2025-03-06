import express from "express";

import userApi from "@/routes/api/user.api";
import sellerApi from "@/routes/api/seller.api";
import productApi from "@/routes/api/product.api";
import authApi from "@/routes/api/auth.api";
import purchaseApi from "@/routes/api/purchase.api";
import organizationApi from "@/routes/api/organization.api";
const router = express.Router();

router.use("/user", userApi);
router.use("/seller", sellerApi);
router.use("/product", productApi);
router.use("/auth", authApi);
router.use("/purchase", purchaseApi);
router.use("/organization", organizationApi);

export default router;
