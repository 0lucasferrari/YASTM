import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { validateRequest } from '../middlewares/validateRequest';
import { updateCommentSchema } from '../validators/commentValidators';
import { uuidParamSchema } from '../validators/userValidators';

export function commentRoutes(commentController: CommentController): Router {
  const router = Router();

  router.get('/:id', validateRequest({ params: uuidParamSchema }), commentController.getById);
  router.put('/:id', validateRequest({ params: uuidParamSchema, body: updateCommentSchema }), commentController.update);
  router.delete('/:id', validateRequest({ params: uuidParamSchema }), commentController.delete);

  return router;
}

