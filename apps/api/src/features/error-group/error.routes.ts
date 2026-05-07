import { analyzeErrorHandler } from "./error.controller.js";
import { Router } from "express";
import { isAuthenticated } from "../../middleware/protect.js";


const ErrorRouter = Router();

ErrorRouter.post("/analyze" , isAuthenticated , analyzeErrorHandler);

export default ErrorRouter ;
