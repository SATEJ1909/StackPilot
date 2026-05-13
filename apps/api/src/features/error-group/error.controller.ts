import { analyzeError } from "./ai.service.js";
import type { RequestHandler } from "express";
import { getErrorGroups, getErrorGroup } from "./error.service.js";

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

export const getErrorGroupHandler: RequestHandler = async (req, res) => {
    try {
        const projectId = req.query.projectId;
        const errorId = req.params.errorId;

        if (typeof projectId !== "string") {
            res.status(400).json({ success: false, message: "projectId query param is required" });
            return;
        }

        if (typeof errorId !== "string") {
            res.status(400).json({ success: false, message: "errorId param is required" });
            return;
        }

        const errorGroup = await getErrorGroup(projectId, errorId, req.userId as string);
        res.status(200).json({ success: true, data: errorGroup });
    } catch (error: any) {
        const message = error instanceof Error ? error.message : "Failed to fetch error group";
        const status = message.includes("Invalid") ? 400 : 404;

        res.status(status).json({ success: false, message });
    }
}

import { ErrorModel } from "./error.model.js";

export const analyzeErrorHandler: RequestHandler = async(req, res) =>{
    try {
        const { errorGroupId, ...data } = req.body ;
        const result = await analyzeError(data);
        
        if (errorGroupId) {
             await ErrorModel.findByIdAndUpdate(errorGroupId, {
                $set: {
                    type: result.type,
                    reasoning: result.reasoning,
                    cause: result.cause,
                    fix: result.fix,
                    severity: result.severity,
                    aiAnalyzed: "done"
                }
             });
        }

        res.status(200).json({success : true , message : "Error analyzed successfully" , data : result});
    } catch (error) {
        console.log("error" , error);
        res.status(500).json({ success : false , message: "Failed to analyze error" });
    }
}
