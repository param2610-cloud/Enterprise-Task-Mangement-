import { Employee } from "../model/employee.model.js";
import { Room } from "../model/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const AddManagerRole = asyncHandler(async (req, res, next) => {
    const { userId, roomId } = req.body;

    if (!(userId || roomId)) {
        throw next(new ApiError(401, "User id or room id not got."));
    }

    const roomDetails = await Room.findById(roomId);

    if (!roomDetails) {
        throw next(new ApiError(401, "room is not created yet."));
    }
    
    const employeeDetails = await Employee.create({
        user: userId,
        role: "Manager",
        roomid: roomId,
    });
    
    const CreatedEmployee = await Employee.findById(employeeDetails._id);
    
    if (!CreatedEmployee) {
        throw next(new ApiError(401, "Employee manager is not created yet."));
    }
    const SyncRoomDetails = await Room.findByIdAndUpdate(CreatedEmployee._id, {
        $push: { manager: CreatedEmployee._id },
    });

    return res.status(201).json(new ApiResponse(201,{SyncRoomDetails,CreatedEmployee},"Manager Role is assigned"));


});

const EmployeeDetailsOnUseridAndRoomId = asyncHandler(async(req,res,next) => {
    const { userId, roomId } = req.query;
    
    try {
        // Fetch employee details
        const EmployeeDetails = await Employee.findOne({ user: userId, roomid: roomId }).exec();

        // Handle case when employee is not found
        if (!EmployeeDetails) {
            return res.status(404).json(new ApiResponse(404, null, "Employee not found"));
        }

        // Return employee details
        return res.status(200).json(new ApiResponse(200, EmployeeDetails, "Employee Found"));
    } catch (error) {
        // Handle unexpected errors
        return next(new ApiError(500, "Server Error: " + error.message));
    }
})

export {AddManagerRole,EmployeeDetailsOnUseridAndRoomId};