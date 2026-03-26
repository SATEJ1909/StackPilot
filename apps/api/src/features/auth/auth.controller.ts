import type { Request , Response } from "express";
import * as AuthService from "./auth.service.js";


export const githubAuth = async (req : Request , res : Response) => {
    const githubAuthUrl = AuthService.getGithubAuthUrl();
    res.redirect(githubAuthUrl);
}

export const githubCallback = async (req : Request , res : Response) => {
    try {
        const code = req.query.code as string;
        const data = await AuthService.handleGithubCallback(code);
        res.json(data);
    } catch (error) {
        console.error("GitHub Callback Error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
}