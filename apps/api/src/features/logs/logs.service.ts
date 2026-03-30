import { ProjectModel } from "../project/project.model.js";
import { ErrorModel } from "../error-group/error.model.js";
import { LogModel } from "./logs.model.js";
import crypto from "crypto";

export const processLog = async (data: any) => {
    const { projectKey, message, stack, route } = data;

    if (!projectKey || !message) {
        throw new Error("Invalid log data");
    }

    // 1. Verify Project (Consider caching this lookup in Redis later)
    const project = await ProjectModel.findOne({ projectKey }).select("_id").lean();
    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Generate a better hash
    // We trim dynamic IDs or use a partial stack trace to prevent group explosion
    const stackLine = stack?.split("\n")[1] || "";
    const cleanMessage = message.replace(/\d+/g, '{id}');

    const hashKey = crypto
        .createHash("md5")
        .update(`${cleanMessage}${route || ""}${stackLine}`)
        .digest("hex");


    const errorGroup = await ErrorModel.findOneAndUpdate(
        { projectId: project._id, hash: hashKey },
        {
            $inc: { count: 1 },
            $set: { lastSeenAt: new Date() },
            $setOnInsert: {
                projectId: project._id,
                hash: hashKey,
                message,
                route
            }
        },
        { upsert: true, new: true }
    );

    // 4. Create the individual log instance
    return await LogModel.create({
        projectId: project._id,
        errorGroupId: errorGroup._id,
        message,
        stack,
        route
    });
};