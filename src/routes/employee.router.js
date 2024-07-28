import express from "express";
import { EmployeeDetailsOnUseridAndRoomId } from "../controllers/employee.controller.js";
const router = express.Router();


router.get("/specific-employee-details",EmployeeDetailsOnUseridAndRoomId);


export default router;