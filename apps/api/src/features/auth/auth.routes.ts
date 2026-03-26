import Router from "express";
const AuthRouter = Router();
import { githubAuth , githubCallback } from "./auth.controller.js";

AuthRouter.get("/github" , githubAuth)
AuthRouter.get("/github/callback" , githubCallback)

export default AuthRouter