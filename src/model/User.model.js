import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    },
    refreshToken:{
        type:String
    },
    avatarUrl:{
        type:String
    }
}, {
    timestamps:true
})

UserSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password =await bcrypt.hash(this.password,10);
    next();
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    const res = await bcrypt.compare(password,this.password);
    return res
}
UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            id:this._id,
            email:this.email,
            name:this.name

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            id:this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",UserSchema);