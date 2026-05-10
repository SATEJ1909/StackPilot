import { analyzeErrorHandler, getErrorGroupsHandler } from "./error.controller.js";
import { Router } from "express";
import { isAuthenticated } from "../../middleware/protect.js";


const ErrorRouter = Router();

ErrorRouter.get("/" , isAuthenticated , getErrorGroupsHandler);
ErrorRouter.post("/analyze" , isAuthenticated , analyzeErrorHandler);

export default ErrorRouter ;
