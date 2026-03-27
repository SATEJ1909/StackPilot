import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const isAuthenticated = (req : Request , res : Response , next : NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token as string , process.env.JWT_SECRET as string) as JwtPayload & { userId?: string };
        if(!decoded?.userId){
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("error" , error);
        return res.status(401).json({ error: "Unauthorized" });
    }
}

