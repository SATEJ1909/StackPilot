import type { RequestHandler } from "express";
import * as AuthService from "./auth.service.js";


export const githubAuth: RequestHandler = async (req, res) => {
    const state = AuthService.createOAuthState();
    const githubAuthUrl = AuthService.getGithubAuthUrl(state);

    res.cookie("github_oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
    });

    res.redirect(githubAuthUrl);
}

export const githubCallback: RequestHandler = async (req, res) => {
    try {
        const code = req.query.code as string;
        const state = req.query.state as string;
        const savedState = getCookie(req.headers.cookie, "github_oauth_state");

        res.clearCookie("github_oauth_state");

        if (!state || !savedState || state !== savedState) {
            res.status(400).json({ error: "Invalid OAuth state" });
            return;
        }

        const data = await AuthService.handleGithubCallback(code);
        res.json(data);
    } catch (error) {
        console.error("GitHub Callback Error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
}

const getCookie = (cookieHeader: string | undefined, name: string) => {
    if (!cookieHeader) {
        return undefined;
    }

    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    const cookie = cookies.find((item) => item.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.split("=")[1] || "") : undefined;
};
