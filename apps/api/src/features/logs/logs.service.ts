import { ProjectModel } from "../project/project.model.js";
import { ErrorModel } from "../error-group/error.model.js";
import { LogModel } from "./logs.model.js";
import crypto from "crypto";
import { analyzeError } from "../error-group/ai.service.js";
export const processLog = async (data: any) => {
    const { projectKey, message, stack, route, timestamp } = data;

    // Validation
    if (!projectKey || typeof projectKey !== "string") {
        throw new Error("Invalid projectKey");
    }

    if (!message || typeof message !== "string") {
        throw new Error("Invalid message");
    }

    if (message.length > 2_000) {
        throw new Error("Invalid message length");
    }

    if (stack && (typeof stack !== "string" || stack.length > 20_000)) {
        throw new Error("Invalid stack");
    }

    if (route && (typeof route !== "string" || route.length > 2_000)) {
        throw new Error("Invalid route");
    }

    // Find Project
    const project = await ProjectModel.findOne({ projectKey })
        .select("_id")
        .lean();

    if (!project) {
        throw new Error("Project not found");
    }

    // Generate Stable Error Hash
    const stackLine = stack?.split("\n")[1] || "";
    const cleanMessage = message.replace(/\d+/g, "{id}");

    const hashKey = crypto
        .createHash("md5")
        .update(`${cleanMessage}${route || ""}${stackLine}`)
        .digest("hex");

    // Atomic Error Group Update
    const update: any = {
        $inc: {
            count: 1
        },

        $set: {
            lastSeenAt: new Date(),
            message,
            route
        },

        $setOnInsert: {
            aiAnalyzed: "pending"
        }
    };

    // Store affected routes uniquely
    if (route) {
        update.$addToSet = {
            affectedRoutes: route
        };
    }

    const errorGroup = await ErrorModel.findOneAndUpdate(
        {
            projectId: project._id,
            hash: hashKey
        },
        update,
        {
            upsert: true,
            returnDocument: "after"
        }
    );

    // Create Individual Log Entry
    const log = await LogModel.create({
        projectId: project._id,
        errorGroupId: errorGroup._id,
        message,
        stack,
        route,
        timestamp: parseTimestamp(timestamp)
    });

    // Lock AI Analysis
    const analysisLock = await ErrorModel.findOneAndUpdate(
        {
            _id: errorGroup._id,
            aiAnalyzed: "pending"
        },
        {
            $set: {
                aiAnalyzed: "processing"
            }
        },
        {
            returnDocument: "after"
        }
    )
        .select("_id")
        .lean();

    // Run AI analysis in background
    if (analysisLock) {
        runBackgroundAnalysis(errorGroup._id, {
            message,
            stack,
            route
        }).catch((err) => {
            console.error("Background AI Error:", err);
        });
    }

    return log;
};

const parseTimestamp = (value: unknown) => {
    if (typeof value !== "string") {
        return new Date();
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
}

// Internal helper for background task
async function runBackgroundAnalysis(errorGroupId: any, data: any) {
    try {
        const aiData = await analyzeError(data);

        await ErrorModel.findByIdAndUpdate(errorGroupId, {
            type: aiData.type,
            reasoning: aiData.reasoning,
            cause: aiData.cause,
            fix: aiData.fix,
            severity: aiData.severity,
            aiAnalyzed: "done"
        });

    } catch (error) {
        console.error("AI Analysis failed:", errorGroupId);

        // rollback so it can retry later
        await ErrorModel.findByIdAndUpdate(errorGroupId, {
            aiAnalyzed: "pending"
        });
    }
}

export const getLogsByErrorGroup = async (projectId: string, errorGroupId: string) => {
    return LogModel.find({
        projectId: projectId,
        errorGroupId: errorGroupId
    })
        .select("message stack route timestamp")
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();
}
