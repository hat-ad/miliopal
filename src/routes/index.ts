import express from "express";

import userApi from "@/routes/api/user.api";
import sellerApi from "@/routes/api/seller.api";

const router = express.Router();

router.use("/user", userApi);
router.use("/seller", sellerApi);

export default router;
