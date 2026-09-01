import "dotenv/config";
import dns from "dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);


async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`https://dev-tutor-api.onrender.com`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();