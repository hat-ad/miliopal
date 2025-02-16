import express from "express";
import BuyerController from "@/controller/buyer.controller";

const router = express.Router();

router.post("/create-buyer", BuyerController.createBuyer);

router.get("/get-buyer/:id", BuyerController.getBuyer);

router.get("/get-buyers-list", BuyerController.getBuyersList);

router.put("/update-buyer/:id", BuyerController.updateBuyer);

router.put("/delete-buyer/:id", BuyerController.deleteBuyer);

export default router;
