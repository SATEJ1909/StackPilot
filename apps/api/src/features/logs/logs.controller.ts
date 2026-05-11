import { processLog } from "./logs.service.js";
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
