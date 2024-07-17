import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET 
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) {
            throw new Error("No local file path provided");
        }

        // Check if the file exists locally
        if (!fs.existsSync(localfilepath)) {
            throw new Error(`Local file ${localfilepath} does not exist`);
        }

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        // Remove the locally saved temporary file
        fs.unlinkSync(localfilepath);

        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error.message);

        // Ensure local file is removed on error
        if (localfilepath && fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }

        return null;
    }
};

export { uploadOnCloudinary };
