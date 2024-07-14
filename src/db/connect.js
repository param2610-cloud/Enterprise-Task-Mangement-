// src/db/connect.js
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.DATABASE_URI;
        if (!uri) {
            throw new Error('DATABASE_URI is not defined');
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;
