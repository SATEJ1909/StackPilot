import mongoose from "mongoose";
import { ProjectModel } from "../project/project.model.js";
import { ErrorModel } from "./error.model.js";

const toObjectId = (value: string, errorMessage: string) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(errorMessage);
    }

    return new mongoose.Types.ObjectId(value);
}

export const getErrorGroups = async (projectId: string, userId: string) => {
    const projectObjectId = toObjectId(projectId, "Invalid project id");
    const userObjectId = toObjectId(userId, "Invalid user id");

    const project = await ProjectModel.findOne({
        _id: projectObjectId,
        userId: userObjectId
    })
        .select("_id")
        .lean();

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    return ErrorModel.find({ projectId: projectObjectId })
        .select("message route affectedRoutes count lastSeenAt cause fix type reasoning severity aiAnalyzed createdAt")
        .sort({ lastSeenAt: -1 })
        .limit(50)
        .lean();
}

export const getErrorGroup = async (projectId: string, errorId: string, userId: string) => {
    const projectObjectId = toObjectId(projectId, "Invalid project id");
    const errorObjectId = toObjectId(errorId, "Invalid error id");
    const userObjectId = toObjectId(userId, "Invalid user id");

    const project = await ProjectModel.findOne({
        _id: projectObjectId,
        userId: userObjectId
    })
        .select("_id")
        .lean();

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    const errorGroup = await ErrorModel.findOne({
        _id: errorObjectId,
        projectId: projectObjectId
    })
        .select("message route affectedRoutes count lastSeenAt cause fix type reasoning severity aiAnalyzed createdAt")
        .lean();

    if (!errorGroup) {
        throw new Error("Error group not found");
    }

    return errorGroup;
}
