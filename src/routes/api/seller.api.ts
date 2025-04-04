import SellerController from "@/controller/seller.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import express from "express";
import { validateCreateSeller } from "../validators/seller/createSeller.validator";

const router = express.Router();

router.post(
  "/create-seller",
  isAuthenticated,
  validateCreateSeller,
  SellerController.getInstance().createSeller
);

router.post(
  "/create-seller-from-invite/:inviteId",
  validateCreateSeller,
  SellerController.getInstance().createSellerFromInvite
);

router.get(
  "/get-seller/:id",
  isAuthenticated,
  SellerController.getInstance().getSeller
);

router.get(
  "/get-sellers-list",
  isAuthenticated,
  SellerController.getInstance().getSellersList
);

router.put(
  "/update-seller/:id",
  isAuthenticated,
  SellerController.getInstance().updateSeller
);

router.put(
  "/delete-seller/:id",
  isAuthenticated,
  SellerController.getInstance().deleteSeller
);

router.get(
  "/get-seller-selling-history/:id",
  isAuthenticated,
  SellerController.getInstance().getSellerSellingHistory
);

router.post(
  "/invite-seller",
  isAuthenticated,
  SellerController.getInstance().inviteSeller
);

router.get(
  "/is-seller-invite-valid/:id",
  isAuthenticated,
  SellerController.getInstance().checkingValidInvitation
);

export default router;
