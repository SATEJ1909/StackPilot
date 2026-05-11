import { createProject, getProjectById, getProjects, deleteProjectById } from "./project.service.js";
import type { RequestHandler } from "express";

export const createProjectHandler: RequestHandler = async (req, res) => {
    try {
        const { name, repoUrl } = req.body ?? {};

        if (!req.body || typeof req.body !== "object") {
            res.status(400).json({
                success: false,
                message: "Request body is required and must be valid JSON",
            });
            return;
        }

        if (!isValidProjectName(name)) {
            res.status(400).json({ success: false, message: "Project name must be between 1 and 80 characters" });
            return;
        }

        if (!isValidUrl(repoUrl)) {
            res.status(400).json({ success: false, message: "Repo URL must be a valid URL" });
            return;
        }

        const project = await createProject(req.userId as string, {
            name: name.trim(),
            repoUrl: repoUrl.trim(),
        });
        res.status(201).json({ success: true, data: project });

    } catch (error: any) {
        // Handle specific duplicate key error from MongoDB
        const status = error.code === 11000 ? 409 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
}

export const getProjectsHandler: RequestHandler = async (req, res) => {
    try {
        // 2. Use Query params for GET requests, and provide defaults
        const page = normalizePositiveInt(req.query.page, 1, 1, 1_000);
        const limit = normalizePositiveInt(req.query.limit, 10, 1, 100);

        const result = await getProjects(req.userId as string, page, limit);
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch projects" });
    }
}

const isValidProjectName = (value: unknown) => {
    return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 80;
}

const isValidUrl = (value: unknown) => {
    if (typeof value !== "string") {
        return false;
    }

    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

const normalizePositiveInt = (
    value: unknown,
    fallback: number,
    min: number,
    max: number
) => {
    const parsed = Number.parseInt(String(value), 10);

    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.min(Math.max(parsed, min), max);
}

export const getProjectByIdHandler: RequestHandler = async (req, res) => {
    try {
        
        const projectId= req.params.id;
        const project = await getProjectById(projectId as string, req.userId as string);

        // 3. Service now handles the "not found" throw, so this catch works perfectly
        res.status(200).json({ success: true, data: project });

    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
}

export const deleteProjectByIdHandler: RequestHandler = async (req, res) => {
    try {
        const { id = '' } = req.params;
        await deleteProjectById(id, req.userId as string);
        
        res.status(200).json({ success: true, message: "Project deleted successfully" });

    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
}
