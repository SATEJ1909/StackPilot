import { analyzeErrorHandler, getErrorGroupsHandler, getErrorGroupHandler } from "./error.controller.js";
import { Router } from "express";
import { isAuthenticated } from "../../middleware/protect.js";


const ErrorRouter = Router();

ErrorRouter.get("/" , isAuthenticated , getErrorGroupsHandler);
ErrorRouter.get("/:errorId" , isAuthenticated , getErrorGroupHandler);
ErrorRouter.post("/analyze" , isAuthenticated , analyzeErrorHandler);

export default ErrorRouter ;
