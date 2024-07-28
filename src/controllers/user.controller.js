import { User } from "../model/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import { Employee } from "../model/employee.model.js";

const registerUser = asyncHandler(async (req, res,next) => {
    const { fullName, email, password } = req.body;
    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw next(new ApiError(400, "All fields are required"));
    }
    const existedUser = await User.findOne({ email }).select(
        "-password -refreshToken"
    );

    if (existedUser) {
        throw next(new ApiError(409, "Email is already exists."));
    }
    const avatarlocalpath = req.file?.path;
    if (!avatarlocalpath) {
        throw next(new ApiError(400, "Avatar file is required ()"));
    }
    const avatarUrl = await uploadOnCloudinary(avatarlocalpath);
    if (!avatarUrl) {
        throw next(new ApiError(400, "Avatar file is required..."));
    }

    const user = await User.create({
        name: fullName,
        email: email,
        avatarUrl: avatarUrl.url,
        password: password,
    });
    const createdUser = await User.findById(user._id)
    if (!createdUser) {
        throw next(new ApiError(500, "something went wrong when registering a user"));
    }
    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered Succesfully"));
});

const generateAccessTokenAndRefreshToken = async (userId) => {
    if (!userId) return null;
    
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken}
};


const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // console.log("email : ", email, "password : ", password)
    if (!email ) {
        return next(new ApiError(401, "Email required."));
    }
    if(!password){
        return next(new ApiError(401, "Password required."));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ApiError(402, "user does not exist."));
    }
    const validateUser = await user.isPasswordCorrect(password);
    if (!validateUser) {
        return next(new ApiError(403, "Password is incorrect"));
    }
    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    const loggedinUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: false,
        sameSite:'Strict',
    };
    if (!(accessToken && refreshToken)) {
        return next(new ApiError(502, "Access token or refresh token not generated"));
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in Succesfully"
            )
        );
});

const logoutUser = asyncHandler((req, res,next) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
        sameSite:"Strict"
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccesstoken = asyncHandler(async (req, res,next) => {
    const incomingRefreshtoken =
        req.cookies.refreshToken || req.headers['authorization'].substring(7);
    if (!incomingRefreshtoken) {
        throw next(new ApiError(401, "unauthorized request"));
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshtoken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?.id);
        if (!user) {
            throw next(new ApiError(401, "Invalid Refresh token"));
        }
        const sentUserId = jwt.decode(incomingRefreshtoken).id;
        const actualUserID = jwt.decode(user?.refreshToken).id;
        if (actualUserID !== sentUserId) {
            throw next(new ApiError(401, "Refresh token is no longer vaild"));
        }
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        };
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: refreshToken,user }, "Access Token refreshed"));
    } catch (error) {
        throw next(new ApiError(401,error?.message || "invalid refresh token"))
    }
});


const validateAccesstoken = asyncHandler(async (req,res,next)=>{
    const incomingAccessToken = req.cookies.accessToken ;
    if (!incomingAccessToken) {
        throw next(new ApiError(401, "unauthorized request"));
    }
    try {
        const decodedToken = jwt.verify(incomingAccessToken,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?.id);
        if (!user) {
            throw next(new ApiError(401, "Invalid Access token"));
        }else{
            return res.status(200).json(new ApiResponse(200,{user},"Vaild Access Token"));
        }
    } catch (error) {
        throw next(new ApiError(401,error?.message || "Invaild Access Token"));
    }
})

const getUserdetails = asyncHandler(async (req,res,next)=>{
    const {userId} = req.query;
    // console.log(userId);
    if(!userId){
        throw next(new ApiError(401,"No user Id found"));
    }
    const userDetails = await User.findById(userId).select("-refreshToken -password");
    if(!userDetails){
        throw next(new ApiError(401,"No user details found"));
    }
    return res.status(200).json(new ApiResponse(200,userDetails,"User found"));
    
})
const getEmployeedetails = asyncHandler(async (req,res,next)=>{
    const {employeeId} = req.query;
    // console.log(userId);
    if(!employeeId){
        throw next(new ApiError(401,"No employee Id found"));
    }
    const employeeDetails = await Employee.findById(employeeId).select("-refreshToken -password");
    if(!employeeDetails){
        throw next(new ApiError(401,"No user details found"));
    }
    return res.status(200).json(new ApiResponse(200,employeeDetails,"User found"));
    
})

export { registerUser, loginUser, logoutUser,refreshAccesstoken, validateAccesstoken,getUserdetails,getEmployeedetails };
