import { analyzeError } from "./ai.service.js";
import type { RequestHandler } from "express";
import { getErrorGroups } from "./error.service.js";

export const getErrorGroupsHandler: RequestHandler = async (req, res) => {
    try {
        const projectId = req.query.projectId;

        if (typeof projectId !== "string") {
            res.status(400).json({ success: false, message: "projectId query param is required" });
            return;
        }

        const errors = await getErrorGroups(projectId, req.userId as string);
        res.status(200).json({ success: true, data: { errors } });
    } catch (error: any) {
        const message = error instanceof Error ? error.message : "Failed to fetch errors";
        const status = message.includes("Invalid") ? 400 : 404;

        res.status(status).json({ success: false, message });
    }
}

export const analyzeErrorHandler: RequestHandler = async(req, res) =>{
    try {
        const data = req.body ;
        const result = await analyzeError(data);
        res.status(200).json({success : true , message : "Error analyzed successfully" , data : result});
    } catch (error) {
        console.log("error" , error);
        res.status(500).json({ success : false , message: "Failed to analyze error" });
    }
}
