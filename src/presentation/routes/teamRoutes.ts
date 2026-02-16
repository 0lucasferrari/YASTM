import { Router } from 'express';
import { TeamController } from '../controllers/TeamController';
import { validateRequest } from '../middlewares/validateRequest';
import { createTeamSchema, updateTeamSchema } from '../validators/teamValidators';
import { uuidParamSchema } from '../validators/userValidators';

export function teamRoutes(teamController: TeamController): Router {
  const router = Router();

  router.post('/', validateRequest({ body: createTeamSchema }), teamController.create);
  router.get('/', teamController.list);
  router.get('/:id', validateRequest({ params: uuidParamSchema }), teamController.getById);
  router.put('/:id', validateRequest({ params: uuidParamSchema, body: updateTeamSchema }), teamController.update);
  router.delete('/:id', validateRequest({ params: uuidParamSchema }), teamController.delete);

  return router;
}

