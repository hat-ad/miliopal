import express from "express";

import userApi from "@/routes/api/user.api";
import sellerApi from "@/routes/api/seller.api";
import buyerApi from "@/routes/api/buyer.api";

const router = express.Router();

router.use("/user", userApi);
router.use("/seller", sellerApi);
router.use("/buyer", buyerApi);

export default router;
