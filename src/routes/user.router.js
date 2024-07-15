import mongoose from "mongoose";
import express from 'express';
import { registerUser } from "../controllers/user.Controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter=  express.Router();

userRouter.route("/register").post(
    upload.single("avatar"),
    registerUser
)


export default userRouter;