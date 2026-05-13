import { processLog, getLogsByErrorGroup } from "./logs.service.js";
import type { RequestHandler } from "express";


export const processLogHandler: RequestHandler = async (req, res) => {
    const data = req.body;
    try {
        await processLog(data);
        res.status(200).json({ success : true , message: "Log processed successfully" });
    } catch (error: any) {
        console.log("error" , error);
        const message = error instanceof Error ? error.message : "Failed to process log";
        const status = message.startsWith("Invalid") || message.includes("required") ? 400 : 500;

        res.status(status).json({ success : false , message });
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
