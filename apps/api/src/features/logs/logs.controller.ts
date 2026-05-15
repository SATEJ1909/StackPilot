import { getLogsByErrorGroup } from "./logs.service.js";
import { logQueue } from "../../lib/queue.js";
import type { RequestHandler } from "express";

export const processLogHandler: RequestHandler = async (req, res) => {
    const data = req.body;
    try {
        // Fast validation before queueing
        if (!data.projectKey || typeof data.projectKey !== "string") {
            res.status(400).json({ success: false, message: "Invalid projectKey" });
            return;
        }

        // Push to BullMQ
        await logQueue.add("processLog", data);
        
        // Respond immediately
        res.status(200).json({ success : true , message: "Log queued successfully" });
    } catch (error: any) {
        console.log("error" , error);
        res.status(500).json({ success : false , message: "Failed to queue log" });
    }
};

export const getLogsHandler: RequestHandler = async (req, res) => {
    try {
        const errorGroupId = req.params.errorGroupId;
        const projectId = req.query.projectId;

        if (typeof projectId !== "string") {
            res.status(400).json({ success: false, message: "projectId query param is required" });
            return;
        }

        if (typeof errorGroupId !== "string") {
            res.status(400).json({ success: false, message: "errorGroupId param is required" });
            return;
        }

        const logs = await getLogsByErrorGroup(projectId, errorGroupId);
        res.status(200).json({ success: true, data: { logs } });
    } catch (error: any) {
        const message = error instanceof Error ? error.message : "Failed to fetch logs";
        const status = message.includes("Invalid") ? 400 : 404;

        res.status(status).json({ success: false, message });
    }
};
