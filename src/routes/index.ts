import express from "express";

import userApi from "@/routes/api/user.api";

const router = express.Router();

router.use("/user", userApi);

export default router;
