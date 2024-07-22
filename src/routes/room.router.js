import express from "express";
import { getEmployeeList, MakeRoom } from "../controllers/room.controller.js";
const router = express.Router();


router.get("/employee-list",getEmployeeList);
router.post("/make-room",MakeRoom);

export default router;