import { analyzeError } from "./ai.service.js";
import type { RequestHandler } from "express";


export const analyzeErrorHandler: RequestHandler = async(req, res) =>{
    try {
        const data = req.body ;
        const result = await analyzeError(data);
        res.status(200).json({success : true , message : "Error analyzed successfully" , data : result});
    } catch (error) {
        console.log("error" , error);
        res.status(500).json({ success : false , message: "Failed to analyze error" });
    }
}
