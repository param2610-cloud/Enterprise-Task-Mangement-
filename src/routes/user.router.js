import mongoose from "mongoose";
import express from "express";
import { loginUser, logoutUser, refreshAccesstoken, registerUser, validateAccesstoken } from "../controllers/user.Controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT, logoutUser);
router.post("/refresh-token",refreshAccesstoken);
router.post("/validate-token",validateAccesstoken);


export default router;
