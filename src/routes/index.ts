import express from "express";

import authApi from "@/routes/api/auth.api";
import organizationApi from "@/routes/api/organization.api";
import pickupDeliveryApi from "@/routes/api/pickup-delivery.api";
import productApi from "@/routes/api/product.api";
import purchaseApi from "@/routes/api/purchase.api";
import receiptApi from "@/routes/api/receipt.api";
import reconciliationApi from "@/routes/api/reconciliation.api";
import sellerApi from "@/routes/api/seller.api";
import todoListApi from "@/routes/api/todo-list.api";
import userApi from "@/routes/api/user.api";

const router = express.Router();

router.use("/user", userApi);
router.use("/seller", sellerApi);
router.use("/product", productApi);
router.use("/auth", authApi);
router.use("/purchase", purchaseApi);
router.use("/pickup-delivery", pickupDeliveryApi);
router.use("/organization", organizationApi);
router.use("/receipt", receiptApi);
router.use("/reconciliation", reconciliationApi);
router.use("/todo-list", todoListApi);

export default router;
