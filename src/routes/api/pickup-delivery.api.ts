import express from "express";

import PickupDeliveryController from "@/controller/pickup-delivery.controller";
import { isAuthenticated } from "@/middleware/checkAuth";
import { validateCreatePickupDelivery } from "../validators/pickupDelivery/createPickupDelivery.validator";

const router = express.Router();

router.post(
  "/create-pickup-delivery",
  isAuthenticated,
  validateCreatePickupDelivery,
  PickupDeliveryController.getInstance().createPickupDelivery
);

router.get(
  "/get-pickup-delivery-list",
  isAuthenticated,
  PickupDeliveryController.getInstance().getPickupDeliveryList
);
router.get(
  "/get-receipt-by-id/:id",
  isAuthenticated,
  PickupDeliveryController.getInstance().getReceiptByID
);

export default router;
