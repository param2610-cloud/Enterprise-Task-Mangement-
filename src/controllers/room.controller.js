import { Employee } from "../model/employee.model.js";
import { Room } from "../model/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getEmployeeList = asyncHandler(async (req, res, next) => {
    const { userId } = req.body;
    if (!userId) {
        throw next(new ApiError(401, "User id not got."));
    }
    try {
        const list = await Employee.find({ User: userId });

        return res
            .status(200)
            .json(new ApiResponse(200, list, "Employee News"));
    } catch (error) {
        throw next(
            new ApiError(
                500,
                error?.message || "Error occured while fethching data."
            )
        );
    }
});

const MakeRoom = asyncHandler(async (req, res, next) => {
    const { userId, RoomName } = req.body;
    if (!userId || !RoomName) {
        throw next(new ApiError(401, "User id not got."));
    }
    const RoomDetails = await Room.create({
        name: RoomName,
        manager: userId,
    });
    const createdRoom = await Room.findById(RoomDetails._id);
    if (!createdRoom) {
        throw next(new ApiError(501, "Room is not created."));
    }
    const roomId = createdRoom._id;
    const employeeDetails = await Employee.create({
        user: userId,
        role: "Manager",
        roomid: roomId,
    });

    const CreatedEmployee = await Employee.findById(employeeDetails._id);

    if (!CreatedEmployee) {
        throw next(new ApiError(401, "Employee manager is not created yet."));
    }
    const SyncRoomDetails = await Room.findByIdAndUpdate(RoomDetails._id, {
        $set: { "manager.0": CreatedEmployee._id },
    });
    if (!SyncRoomDetails) {
        throw next(new ApiError(401, "Room is not updated."));
    }
    return res
        .status(201)
        .json(new ApiResponse(200, createdRoom, "Room created Succesfully"));
});

const AddManagerinRoom = asyncHandler(async (req, res, next) => {
    const { userId, roomId } = req.body;

    if (!userId) {
        throw next(new ApiError(401, "User id is not recieved."));
    }
    const checkForAnyEmployeeeRecordInThisRoom = await Employee.find({
        user: userId,
        roomid: roomId,
    });

    if (checkForAnyEmployeeeRecordInThisRoom.length > 0) {
        const employee = await Employee.findById(
            checkForAnyEmployeeeRecordInThisRoom[0]._id
        );

        if (employee) {
            const roomTasks = employee.tasks.room;
            employee.tasks.room = [];
            employee.tasks.personal = [
                ...employee.tasks.personal,
                ...roomTasks,
            ];
            employee.role = "Manager";
            await employee.save();
        }

        if (UpdatedEmployee) {
            const UpdatedRoom = await Room.findByIdAndUpdate(roomId, {
                $push: { manager: UpdatedEmployee._id },
            });
            if (UpdatedRoom) {
                return res
                    .status(201)
                    .json(
                        new ApiResponse(
                            200,
                            UpdatedRoom,
                            "Room updated Succesfully"
                        )
                    );
            }
        }
    } else {
        const employeeDetails = await Employee.create({
            user: userId,
            role: "Manager",
            roomid: roomId,
        });

        const CreatedEmployee = await Employee.findById(employeeDetails._id);

        if (!CreatedEmployee) {
            throw next(
                new ApiError(401, "Employee manager is not created yet.")
            );
        }
        const SyncRoomDetails = await Room.findByIdAndUpdate(RoomDetails._id, {
            $push: { manager: CreatedEmployee._id },
        });
        if (!SyncRoomDetails) {
            throw next(new ApiError(401, "Room is not updated."));
        }
        if (SyncRoomDetails) {
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        200,
                        UpdatedRoom,
                        "Room updated Succesfully"
                    )
                );
        }
    }
});

const deleteMangerFromRoom = asyncHandler(async (req, res, next) => {
    const { ParentManagerId, roomId, DeleteMangerId } = req.body;
    const incomingParentManagerId = ParentManagerId;
    const roomDetails = await Room.findById(roomId);
    if (!roomDetails) {
        throw next(new ApiError(401, "No Room Found"));
    }
    const actualParentMangerId = roomDetails.manager[0];

    if (actualParentMangerId) {
        if (actualParentMangerId === incomingParentManagerId) {
            const updatedRoom = await Room.findByIdAndUpdate(roomId, {
                $pull: { manager: DeleteMangerId },
            });
            if (updatedRoom) {
                return res
                    .status(201)
                    .json(
                        new ApiResponse(
                            200,
                            updatedRoom,
                            "Room updated Succesfully"
                        )
                    );
            }
        }
    }
});

const UpdateMangerToEmployeeinRoom = asyncHandler(async(req,res,next)=>{
    const {ParentManagerId,roomId,UpdateManagerId} = req.body;
    if(!(ParentManagerId ||roomId || UpdateManagerId) && ParentManagerId!==UpdateManagerId){
        throw next(new ApiError(401, "ParentManagerId ||roomId || UpdateManagerId not Found or same manager id "));
    }
    const roomDetails = Room.findById(roomId);
    if(!roomDetails){
        throw next(new ApiError(401, "No Room Found"));
    }
    const actualparentId = roomDetails.manager[0];
    if(actualparentId!==ParentManagerId){
        throw next(new ApiError(401, "He is not a parent room manager."));
    }
    const managerExists = roomDetails.manager.some(id=>id.toString()===UpdateManagerId)
    if(managerExists){
        Room.updateOne({ _id: roomId }, {
            $pull: { manager: UpdateManagerId },
            $push: { employees: UpdateManagerId }
          });
          const employeetask = Employee.findById(UpdateManagerId);
        //   const managerTask = 
        const updatedEmployee = Employee.updateOne({_id: UpdateManagerId}, {
            $set : {Role: "Employee"}
        })
    }
})

const AddEmployeeInRoom = asyncHandler(async(req,res,next)=>{
    // const {managerId,userId}
})

export { getEmployeeList, MakeRoom,AddManagerinRoom,deleteMangerFromRoom };
