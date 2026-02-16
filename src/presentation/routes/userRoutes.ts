import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateRequest } from '../middlewares/validateRequest';
import { uuidParamSchema, updateUserSchema } from '../validators/userValidators';

export function userRoutes(userController: UserController): Router {
  const router = Router();

  router.get('/', userController.list);
  router.get('/:id', validateRequest({ params: uuidParamSchema }), userController.getById);
  router.put('/:id', validateRequest({ params: uuidParamSchema, body: updateUserSchema }), userController.update);
  router.delete('/:id', validateRequest({ params: uuidParamSchema }), userController.delete);

  return router;
}

