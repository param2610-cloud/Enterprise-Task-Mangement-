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

const generateAccesstokenAndRefreshToken = async (userId) => {
    if (!userId) return null;
    const user = await User.findById(userId);
    const accesstoken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshToken };
};

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        return ApiError(401, "Email and password required.");
    }
    const user = await User.findOne({ email });
    if (!user) {
        return ApiError(402, "user does not exist.");
    }
    const validateUser = await user.isPasswordCorrect(password);
    if (!validateUser) {
        return ApiError(403, "Password is incorrect");
    }

    const { accessToken, refreshToken } =
        await generateAccesstokenAndRefreshToken(user._id);

    const loggedinUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return (
        res.status(200).cookie("accessToken", accessToken, options),
        cookie("refreshToken", refreshToken, options).json(
            new ApiResponse(200, {
                user: loggedinUser,
                accessToken,
                refreshToken,
            },
        "User logged in Succesfully")
        )
    );
});
export { registerUser };
