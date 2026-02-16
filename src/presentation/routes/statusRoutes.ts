import { Router } from 'express';
import { StatusController } from '../controllers/StatusController';
import { validateRequest } from '../middlewares/validateRequest';
import { createStatusSchema, updateStatusSchema } from '../validators/statusValidators';
import { uuidParamSchema } from '../validators/userValidators';

export function statusRoutes(statusController: StatusController): Router {
  const router = Router();

  router.post('/', validateRequest({ body: createStatusSchema }), statusController.create);
  router.get('/', statusController.list);
  router.get('/:id', validateRequest({ params: uuidParamSchema }), statusController.getById);
  router.put('/:id', validateRequest({ params: uuidParamSchema, body: updateStatusSchema }), statusController.update);
  router.delete('/:id', validateRequest({ params: uuidParamSchema }), statusController.delete);

  return router;
}

