import mongoose, { Schema } from "mongoose";


const RoomSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    employees:{
        type: [Schema.Types.ObjectId],
        ref: 'Employee'
    },
    manager:{
        type: [Schema.Types.ObjectId],
        ref: 'Employee'

    }
});

export const Room = mongoose.model('Room',RoomSchema);
