import express from "express";

import buyerApi from "@/routes/api/buyer.api";
import sellerApi from "@/routes/api/seller.api";
import productApi from "@/routes/api/product.api";

const router = express.Router();

router.use("/buyer", buyerApi);
router.use("/seller", sellerApi);
router.use("/product", productApi);

export default router;
