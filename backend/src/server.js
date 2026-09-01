import "dotenv/config";
import dns from "dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Use reliable DNS servers
dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

// Prevent creating multiple MongoDB connections
let dbPromise = null;

function connectDatabase() {
    if (!dbPromise) {
        dbPromise = connectDB();
    }

    return dbPromise;
}

// Vercel serverless handler
const handler = async (req, res) => {
    try {
        // Connect to MongoDB before handling the request
        await connectDatabase();

        // Pass the request to Express
        return app(req, res);
    } catch (error) {
        console.error("Database connection failed:", error);

        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: process.env.NODE_ENV === "development"
                ? error.message
                : undefined
        });
    }
};

export default handler;