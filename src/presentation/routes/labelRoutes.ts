import { Router } from 'express';
import { LabelController } from '../controllers/LabelController';
import { validateRequest } from '../middlewares/validateRequest';
import { createLabelSchema, updateLabelSchema } from '../validators/labelValidators';
import { uuidParamSchema } from '../validators/userValidators';

export function labelRoutes(labelController: LabelController): Router {
  const router = Router();

  router.post('/', validateRequest({ body: createLabelSchema }), labelController.create);
  router.get('/', labelController.list);
  router.get('/:id', validateRequest({ params: uuidParamSchema }), labelController.getById);
  router.put('/:id', validateRequest({ params: uuidParamSchema, body: updateLabelSchema }), labelController.update);
  router.delete('/:id', validateRequest({ params: uuidParamSchema }), labelController.delete);

  return router;
}

