import "./env.js";
import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import AuthRouter from "./features/auth/auth.routes.js";
import ProjectRouter from "./features/project/project.routes.js";
import LogsRouter from "./features/logs/logs.routes.js";
import ErrorRouter from "./features/error-group/error.routes.js";
import "./workers/log.worker.js";

import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { initializeSocket } from "./lib/socket.js";

const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.disable("x-powered-by");
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
}));

// Apply global rate limiter
app.use("/api", globalRateLimiter);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/project", ProjectRouter);
app.use("/api/v1/logs", LogsRouter);
app.use("/api/v1/error", ErrorRouter);
app.use("/health" , ()=>{
    console.log("Health check Success");
})

const PORT = process.env.PORT || 5000;

async function main(){
    validateEnvironment();

    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is required");
    }

    await mongoose.connect(mongoUri)
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

function validateEnvironment() {
    const required = [
        "MONGO_URI",
        "JWT_SECRET",
        "GITHUB_CLIENT_ID",
        "GITHUB_CLIENT_SECRET",
        "OPENROUTER_API_KEY",
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
}

main().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
