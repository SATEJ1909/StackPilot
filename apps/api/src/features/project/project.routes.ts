import Router from 'express';
import { isAuthenticated } from '../../middleware/protect.js';
import { createProjectHandler , getProjectByIdHandler , getProjectsHandler , deleteProjectByIdHandler } from './project.controller.js';

const ProjectRouter = Router();

//@ts-ignore
ProjectRouter.post("/" , isAuthenticated , createProjectHandler);
//@ts-ignore
ProjectRouter.get("/" , isAuthenticated , getProjectsHandler);
//@ts-ignore
ProjectRouter.get("/:id" , isAuthenticated , getProjectByIdHandler);
//@ts-ignore
ProjectRouter.delete("/:id" , isAuthenticated , deleteProjectByIdHandler);

export default ProjectRouter ;