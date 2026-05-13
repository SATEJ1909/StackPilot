import { processLogHandler, getLogsHandler } from "./logs.controller.js";
import Router from "express";
import { createRateLimiter } from "../../middleware/rateLimit.js";
import { isAuthenticated } from "../../middleware/protect.js";

const LogsRouter = Router();

const logRateLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 120,
    keyGenerator: (req) => {
        const projectKey = req.body?.projectKey;
        return typeof projectKey === "string" ? `project:${projectKey}` : `ip:${req.ip}`;
    },
});

LogsRouter.post("/" , logRateLimiter , processLogHandler);
LogsRouter.get("/:errorGroupId", isAuthenticated, getLogsHandler);

export default LogsRouter ;
