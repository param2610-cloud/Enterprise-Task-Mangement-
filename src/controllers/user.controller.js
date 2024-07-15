import { User } from "../model/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;
    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser =await User.findOne({ email });

    if (existedUser) {
        console.log(existedUser)
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

export { registerUser };
