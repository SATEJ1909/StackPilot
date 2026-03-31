import { analyzeErrorHandler } from "./error.controller.js";
import { Router } from "express";


const ErrorRouter = Router();

//@ts-ignore
ErrorRouter.post("/analyze" , analyzeErrorHandler);

export default ErrorRouter ;