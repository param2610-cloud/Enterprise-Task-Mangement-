import mongoose from "mongoose";
import express from "express";
import { registerUser } from "../controllers/user.Controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);

export default router;
