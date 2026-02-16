import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../validators/authValidators';

export function authRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', validateRequest({ body: registerSchema }), authController.register);
  router.post('/login', validateRequest({ body: loginSchema }), authController.login);

  return router;
}

