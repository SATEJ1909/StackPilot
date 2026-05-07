import Router from 'express';
import { isAuthenticated } from '../../middleware/protect.js';
import { createProjectHandler , getProjectByIdHandler , getProjectsHandler , deleteProjectByIdHandler } from './project.controller.js';

const ProjectRouter = Router();

ProjectRouter.post("/" , isAuthenticated , createProjectHandler);
ProjectRouter.get("/" , isAuthenticated , getProjectsHandler);
ProjectRouter.get("/:id" , isAuthenticated , getProjectByIdHandler);
ProjectRouter.delete("/:id" , isAuthenticated , deleteProjectByIdHandler);

export default ProjectRouter ;
