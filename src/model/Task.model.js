import mongoose, { Schema } from "mongoose";

const TaskSchema = new mongoose.Schema({
    "#ticket":{
        type:Number,
        unique:true,
        required:true
    },
    title:{
        type:string,
        default:"No Title"
    },
    body:{
        type:string,
        reruired:true,
        default:"No body"
    },
    status:{
        type:Boolean,
        required:true,
        default:false
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    deadline:{
        type:Date,
        required: true
    },
    roomid:{
        type:Schema.Types.ObjectId,
        ref:'Room',
    },assignTo:{
        type:Schema.Types.ObjectId,
        ref:'Employee'
    }
},{timestamps:{
    createdAt: 'created_at',
    updatedAt:'updated_at'
}});

export const Task = mongoose.model('Task',TaskSchema);