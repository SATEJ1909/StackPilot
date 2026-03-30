import { processLogHandler } from "./logs.controller.js";
import Router from "express";
const LogsRouter = Router();

//@ts-ignore
LogsRouter.post("/" , processLogHandler);

export default LogsRouter ;