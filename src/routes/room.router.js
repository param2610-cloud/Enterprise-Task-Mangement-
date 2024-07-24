import express from "express";
import { getEmployeeList, GetRoomDetails, MakeRoom } from "../controllers/room.controller.js";
const router = express.Router();


router.get("/employee-list",getEmployeeList);
router.get("/room-details",GetRoomDetails);
router.post("/make-room",MakeRoom);

export default router;