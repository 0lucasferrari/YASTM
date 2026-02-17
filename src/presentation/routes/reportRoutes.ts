import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { validateRequest } from '../middlewares/validateRequest';
import { taskIdParamSchema } from '../validators/taskValidators';

export function reportRoutes(reportController: ReportController): Router {
  const router = Router();

  router.get('/tasks/:id', validateRequest({ params: taskIdParamSchema }), reportController.getTaskReport);

  return router;
}

