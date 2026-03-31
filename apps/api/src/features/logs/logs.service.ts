import { ProjectModel } from "../project/project.model.js";
import { ErrorModel } from "../error-group/error.model.js";
import { LogModel } from "./logs.model.js";
import crypto from "crypto";
import { analyzeError } from "../error-group/ai.service.js";
export const processLog = async (data: any) => {
    const { projectKey, message, stack, route } = data;

    if (!projectKey || typeof projectKey !== "string") {
        throw new Error("Invalid projectKey");
    }

    if (!message || typeof message !== "string") {
        throw new Error("Invalid message");
    }

    const project = await ProjectModel.findOne({ projectKey }).select("_id").lean();
    if (!project) throw new Error("Project not found");

    // 1. Generate Hash
    const stackLine = stack?.split("\n")[1] || "";
    const cleanMessage = message.replace(/\d+/g, "{id}");
    const hashKey = crypto.createHash("md5")
        .update(`${cleanMessage}${route || ""}${stackLine}`)
        .digest("hex");

    // 2. Atomic Update (Instant & Safe)
    // This avoids the race condition and is extremely fast
    const errorGroup = await ErrorModel.findOneAndUpdate(
        { projectId: project._id, hash: hashKey },
        {
            $inc: { count: 1 },
            $set: { lastSeenAt: new Date(), message, route },
            $addToSet: { affectedRoutes: route }, // Cleaner way to handle unique routes
            $setOnInsert: {
                message,
                route,
                aiAnalyzed: "pending"
            }
        },
        { upsert: true, new: true }
    );

    // 3. Create Log Instance (Immediately)
    const log = await LogModel.create({
        projectId: project._id,
        errorGroupId: errorGroup._id,
        message, stack, route,
    });

    // 4. Background AI Analysis (Non-blocking)
    // We only run this if the error hasn't been analyzed yet
    if (!errorGroup.aiAnalyzed || errorGroup.aiAnalyzed === "pending") {
        // Start the analysis but DO NOT 'await' it
        runBackgroundAnalysis(errorGroup._id, { message, stack, route })
            .catch(err => console.error("Background AI Error:", err));
    }

    return log;
};

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