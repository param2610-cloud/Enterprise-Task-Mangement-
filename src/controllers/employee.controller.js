import { Employee } from "../model/employee.model";
import { Room } from "../model/room.model";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

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

export {AddManagerRole};