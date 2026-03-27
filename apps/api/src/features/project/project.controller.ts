import { createProject, getProjectById, getProjects, deleteProjectById } from "./project.service.js";
import type { Request, Response } from "express";

export const createProjectHandler = async (req: Request, res: Response) => {
    try {
        const { name, repoUrl } = req.body;

        // 1. Immediate validation
        if (!name || !repoUrl) {
            return res.status(400).json({ success: false, message: "Name and Repo URL are required" });
        }

        const project = await createProject(req.userId as string, req.body);
        res.status(201).json({ success: true, data: project });

    } catch (error: any) {
        // Handle specific duplicate key error from MongoDB
        const status = error.message.includes("exists") ? 409 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
}

export const getProjectsHandler = async (req: Request, res: Response) => {
    try {
        // 2. Use Query params for GET requests, and provide defaults
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await getProjects(req.userId as string, page, limit);
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch projects" });
    }
}

export const getProjectByIdHandler = async (req: Request, res: Response) => {
    try {
        
        const projectId= req.params.id;
        const project = await getProjectById(projectId as string, req.userId as string);

        // 3. Service now handles the "not found" throw, so this catch works perfectly
        res.status(200).json({ success: true, data: project });

    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
}

export const deleteProjectByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id = '' } = req.params;
        await deleteProjectById(id, req.userId as string);
        
        res.status(200).json({ success: true, message: "Project deleted successfully" });

    } catch (error: any) {
        res.status(404).json({ success: false, message: error.message });
    }
}