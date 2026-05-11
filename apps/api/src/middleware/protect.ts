import jwt, { type JwtPayload } from "jsonwebtoken";
import type { RequestHandler } from "express";

export const isAuthenticated: RequestHandler = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token as string , process.env.JWT_SECRET as string) as JwtPayload & { userId?: string };
        if(!decoded?.userId){
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("error" , error);
        res.status(401).json({ error: "Unauthorized" });
    }
}

