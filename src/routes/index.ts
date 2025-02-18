import express from "express";

import userApi from "@/routes/api/user.api";
import sellerApi from "@/routes/api/seller.api";
import buyerApi from "@/routes/api/buyer.api";
import productApi from "@/routes/api/product.api";

const router = express.Router();

router.use("/user", userApi);
router.use("/seller", sellerApi);
router.use("/buyer", buyerApi);
router.use("/product", productApi);

export default router;
