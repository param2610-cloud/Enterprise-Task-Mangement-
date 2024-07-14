import mongoose, { Schema } from "mongoose";

const EmployeeSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    role:{
        type:String,
        default:"No Role"
    },
    tasks:{
        room:{
            type:[Schema.Types.ObjectId],
            ref:'Task'
        },
        personal:{
            type:[Schema.Types.ObjectId],
            ref:'Task'
        }
    },
    roomid:{
        type:Schema.Types.ObjectId,
        ref:'Room',
    }
},{timestamps:true});

export const Employee = mongoose.model('Employee',EmployeeSchema);