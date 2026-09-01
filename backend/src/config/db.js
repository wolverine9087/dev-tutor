import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");

        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};