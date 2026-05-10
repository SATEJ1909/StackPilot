import mongoose from "mongoose"
import { ProjectModel } from "./project.model.js";
import crypto from "crypto";
import { ErrorModel } from "../error-group/error.model.js";
import { LogModel } from "../logs/logs.model.js";

const GenerateProjectKey = () => {
    return crypto.randomBytes(16).toString("hex");
}

const toObjectId = (value: string, errorMessage: string) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(errorMessage);
    }

    return new mongoose.Types.ObjectId(value);
}


export const createProject = async (userId: string, data: any) => {
    const userObjectId = toObjectId(userId, "Invalid user id");

    const project = await ProjectModel.create({
        name: data.name,
        userId: userObjectId,
        repoUrl: data.repoUrl,
        projectKey: GenerateProjectKey()
    });
    return project;
}


export const getProjects = async (
    userId: string,
    page: number = 1,
    limit: number = 10
) => {
    const userObjectId = toObjectId(userId, "Invalid user id");
    const skip = (page - 1) * limit;

    // 1. Fetch data and total count in parallel for speed
    const [projects, total] = await Promise.all([
        ProjectModel.find({ userId: userObjectId })
            .select("name repoUrl projectKey createdAt") // 2. Projection: Only get what the UI needs
            .sort({ createdAt: -1 })         // 3. Sorting: Newest first
            .skip(skip)
            .limit(limit)
            .lean(),                         // 4. Lean: Returns plain JS objects (faster than Mongoose docs)
        ProjectModel.countDocuments({ userId: userObjectId })
    ]);

    return {
        projects,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalProjects: total
    };
}


export const getProjectById = async (projectId: string, userId: string) => {
    const projectObjectId = toObjectId(projectId, "Invalid project id");
    const userObjectId = toObjectId(userId, "Invalid user id");

    const project = await ProjectModel.findOne({
        _id: projectObjectId,
        userId: userObjectId
    }).lean();
    if (!project) throw new Error("Project not found or access denied");
    return project;
}


export const deleteProjectById = async (projectId: string, userId: string) => {
    const projectObjectId = toObjectId(projectId, "Invalid project id");
    const userObjectId = toObjectId(userId, "Invalid user id");

    const project = await ProjectModel.findOne({
        _id: projectObjectId,
        userId: userObjectId
    }).select("_id").lean();

    if (!project) throw new Error("Project not found or access denied");

    await Promise.all([
        LogModel.deleteMany({ projectId: projectObjectId }),
        ErrorModel.deleteMany({ projectId: projectObjectId }),
        ProjectModel.deleteOne({ _id: projectObjectId, userId: userObjectId }),
    ]);

    return project;
}
