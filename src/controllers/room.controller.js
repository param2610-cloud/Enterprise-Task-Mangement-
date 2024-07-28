import { Employee } from "../model/employee.model.js";
import { Room } from "../model/room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getEmployeeList = asyncHandler(async (req, res, next) => {
    const { userId } = req.query;
    if (!userId) {
        throw next(new ApiError(401, "User id not got."));
    }
    try {
        const list = await Employee.find({ user: userId });
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
const GetRoomDetails = asyncHandler(async (req,res,next)=>{
    const {roomId} = req.query;
    if(!roomId){
        throw next(
        new ApiError(
            500,
            error?.message || "Error occured while fethching data."
        )
    )
    
    }
    const RoomDetails = await Room.findById(roomId);
    return res
            .status(200)
            .json(new ApiResponse(200, RoomDetails, "Room Details"));
})

const MakeRoom = asyncHandler(async (req, res, next) => {
    const { user, RoomName } = req.body;
    const userId = user;
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
    const createdRoom2 = await Room.findById(RoomDetails._id);
    if (!createdRoom2) {
        throw next(new ApiError(401, "Room is not found."));
    }
    return res
        .status(201)
        .json(new ApiResponse(200, createdRoom2, "Room created Succesfully"));
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

const UpdateMangerToEmployeeinRoom = asyncHandler(async (req, res, next) => {
    const { ParentManagerId, roomId, UpdateManagerId } = req.body;
    if (
        !(ParentManagerId || roomId || UpdateManagerId) &&
        ParentManagerId !== UpdateManagerId
    ) {
        throw next(
            new ApiError(
                401,
                "ParentManagerId ||roomId || UpdateManagerId not Found or same manager id "
            )
        );
    }
    const roomDetails = Room.findById(roomId);
    if (!roomDetails) {
        throw next(new ApiError(401, "No Room Found"));
    }
    const actualparentId = roomDetails.manager[0];
    if (actualparentId !== ParentManagerId) {
        throw next(new ApiError(401, "He is not a parent room manager."));
    }
    const managerExists = roomDetails.manager.some(
        (id) => id.toString() === UpdateManagerId
    );
    if (!managerExists) {
        throw next(new ApiError(401, "Manager is not exist at room"));
    }
    Room.updateOne(
        { _id: roomId },
        {
            $pull: { manager: UpdateManagerId },
            $push: { employees: UpdateManagerId },
        }
    );
    const employeetask = Employee.findById(UpdateManagerId);
    const managerTask = employeetask.tasks.personal;
    const updatedEmployee = Employee.updateOne(
        { _id: UpdateManagerId },
        {
            $set: { Role: "Employee", "tasks.personal": [] },
        }
    );
    if (!updatedEmployee) {
        throw next(new ApiError(501, "Employee is not updated"));
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { tasks: managerTask, updatedEmployee },
                "Room updated Succesfully"
            )
        );
});

const AddEmployeeInRoom = asyncHandler(async (req, res, next) => {
    const { ParentManagerId, userId, roomId } = req.body;
    if (!(ParentManagerId || roomId)) {
        throw next(
            new ApiError(
                401,
                "ParentManagerId ||roomId  not Found or same manager id "
            )
        );
    }
    const roomDetails = Room.findById(roomId);
    if (!roomDetails) {
        throw next(new ApiError(401, "No Room Found"));
    }
    const actualparentId = roomDetails.manager[0];
    if (actualparentId !== ParentManagerId) {
        throw next(new ApiError(401, "He is not a parent room manager."));
    }

    const checkForAnyEmployeeeRecordInThisRoom = await Employee.find({
        user: userId,
        roomid: roomId,
    });
    if (checkForAnyEmployeeeRecordInThisRoom) {
        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    checkForAnyEmployeeeRecordInThisRoom,
                    "User is already employee in this room"
                )
            );
    }
    const newEmployee = await Employee.create({
        user: userId,
        role: "Employee",
        roomid: roomId,
    });
    if (!newEmployee) {
        throw next(new ApiError(501, "Unable to create Employee"));
    }
    const updatedRoom = Room.findByIdAndUpdate(roomId, {
        $push: { employees: newEmployee._id },
    });
    if (!updatedRoom) {
        throw next(new ApiError(501, "Unable to update Room"));
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                newEmployee,
                updatedRoom,
                "Employee Created and room updated."
            )
        );
});

const DeleteEmployeeFromRoom = asyncHandler(async (req, res, next) => {
    const { ParentManagerId, userId, roomId } = req.body;

    if (!(ParentManagerId || roomId)) {
        throw next(new ApiError(401, "ParentManagerId or roomId not Found"));
    }

    const roomDetails = await Room.findById(roomId).populate('employees');

    if (!roomDetails) {
        throw next(new ApiError(401, "No Room Found"));
    }

    const actualParentId = roomDetails.manager[0];

    if (actualParentId !== ParentManagerId) {
        throw next(new ApiError(401, "You are not the parent room manager."));
    }

    const employeeRecord = await Employee.findOne({ user: userId, roomid: roomId });

    if (!employeeRecord) {
        return res.status(404).json(new ApiResponse(404, null, "Employee not found in this room"));
    }

    const employeeDetails = await Employee.findById(employeeRecord[0]._id)
    const roomTasks = employeeDetails.tasks.room;
    await Employee.deleteOne({ user: userId, roomid: roomId });

    await Room.findByIdAndUpdate(roomId, {
        $pull: { employees: employeeRecord._id }
    });

    

    return res.status(200).json(new ApiResponse(200, roomTasks, "Employee removed and room tasks fetched."));
});


export {
    getEmployeeList,
    MakeRoom,
    AddManagerinRoom,
    deleteMangerFromRoom,
    UpdateMangerToEmployeeinRoom,
    AddEmployeeInRoom,
    DeleteEmployeeFromRoom,
    GetRoomDetails
};
