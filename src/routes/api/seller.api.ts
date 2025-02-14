import express from "express";
import SellerController from "@/controller/seller.controller";

const router = express.Router();

router.post("/create-seller", SellerController.createSeller);

router.get("/get-seller/:id", SellerController.getSeller);

router.get("/get-sellers-list", SellerController.getSellersList);

router.put("/update-seller/:id", SellerController.updateSeller);

router.put("/delete-seller/:id", SellerController.deleteSeller);

export default router;
