import { User } from "../model/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;
    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({ email }).select(
        "-password -refreshToken"
    );

    if (existedUser) {
        console.log(existedUser);
        throw new ApiError(409, "Email is already exists.");
    }
    const avatarlocalpath = req.file?.path;
    if (!avatarlocalpath) {
        throw new ApiError(400, "Avatar file is required ()");
    }
    const avatarUrl = await uploadOnCloudinary(avatarlocalpath);
    if (!avatarUrl) {
        throw new ApiError(400, "Avatar file is required...");
    }
    console.log(avatarUrl);
    const user = await User.create({
        name: fullName,
        email: email,
        avatarUrl: avatarUrl.url,
        password: password,
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(500, "something went wrong when registering a user");
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


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        return new ApiError(401, "Email and password required.");
    }
    const user = await User.findOne({ email });
    if (!user) {
        return new ApiError(402, "user does not exist.");
    }
    const validateUser = await user.isPasswordCorrect(password);
    if (!validateUser) {
        return new ApiError(403, "Password is incorrect");
    }
    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    const loggedinUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    if (!(accessToken && refreshToken)) {
        return new ApiError(502, "Access token or refresh token not generated");
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

const logoutUser = asyncHandler((req, res) => {
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
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccesstoken = asyncHandler(async (req, res) => {
    const incomingRefreshtoken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshtoken) {
        throw new ApiError(401, "unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshtoken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?.id);
        if (!user) {
            throw new ApiError(401, "Invalid Refresh token");
        }
        const sentUserId = jwt.decode(incomingRefreshtoken).id;
        const actualUserID = jwt.decode(user?.refreshToken).id;
        if (actualUserID !== sentUserId) {
            throw new ApiError(401, "Refresh token is no longer vaild");
        }
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true,
        };
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: refreshToken }, "Access Token refreshed"));
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
});

export { registerUser, loginUser, logoutUser,refreshAccesstoken };
