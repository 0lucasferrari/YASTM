import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createTaskSchema,
  updateTaskSchema,
  addAssigneeSchema,
  addStatusSchema,
  setCurrentStatusSchema,
  addLabelSchema,
  addCommentSchema,
  taskIdParamSchema,
  taskAssigneeParamSchema,
  taskLabelParamSchema,
} from '../validators/taskValidators';

export function taskRoutes(taskController: TaskController): Router {
  const router = Router();

  // CRUD
  router.post('/', validateRequest({ body: createTaskSchema }), taskController.create);
  router.get('/', taskController.list);
  router.get('/:id', validateRequest({ params: taskIdParamSchema }), taskController.getById);
  router.put('/:id', validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }), taskController.update);
  router.delete('/:id', validateRequest({ params: taskIdParamSchema }), taskController.delete);

  // Assignees
  router.post('/:id/assignees', validateRequest({ params: taskIdParamSchema, body: addAssigneeSchema }), taskController.addAssignee);
  router.delete('/:id/assignees/:userId', validateRequest({ params: taskAssigneeParamSchema }), taskController.removeAssignee);

  // Statuses
  router.post('/:id/statuses', validateRequest({ params: taskIdParamSchema, body: addStatusSchema }), taskController.addStatus);
  router.put('/:id/current-status', validateRequest({ params: taskIdParamSchema, body: setCurrentStatusSchema }), taskController.setCurrentStatus);

  // Labels
  router.post('/:id/labels', validateRequest({ params: taskIdParamSchema, body: addLabelSchema }), taskController.addLabel);
  router.delete('/:id/labels/:labelId', validateRequest({ params: taskLabelParamSchema }), taskController.removeLabel);

  // Comments
  router.post('/:id/comments', validateRequest({ params: taskIdParamSchema, body: addCommentSchema }), taskController.addComment);

  return router;
}

