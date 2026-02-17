import { Request, Response, NextFunction } from 'express';
import { CreateTaskUseCase } from '../../application/use-cases/task/CreateTaskUseCase';
import { ListTasksUseCase } from '../../application/use-cases/task/ListTasksUseCase';
import { GetTaskUseCase } from '../../application/use-cases/task/GetTaskUseCase';
import { UpdateTaskUseCase } from '../../application/use-cases/task/UpdateTaskUseCase';
import { DeleteTaskUseCase } from '../../application/use-cases/task/DeleteTaskUseCase';
import { AddAssigneeUseCase } from '../../application/use-cases/task/AddAssigneeUseCase';
import { RemoveAssigneeUseCase } from '../../application/use-cases/task/RemoveAssigneeUseCase';
import { AddTaskStatusUseCase } from '../../application/use-cases/task/AddTaskStatusUseCase';
import { RemoveTaskStatusUseCase } from '../../application/use-cases/task/RemoveTaskStatusUseCase';
import { SetCurrentStatusUseCase } from '../../application/use-cases/task/SetCurrentStatusUseCase';
import { AddTaskLabelUseCase } from '../../application/use-cases/task/AddTaskLabelUseCase';
import { RemoveTaskLabelUseCase } from '../../application/use-cases/task/RemoveTaskLabelUseCase';
import { CloneTaskUseCase } from '../../application/use-cases/task/CloneTaskUseCase';
import { CreateCommentUseCase } from '../../application/use-cases/comment/CreateCommentUseCase';
import { ListCommentsByTaskUseCase } from '../../application/use-cases/comment/ListCommentsByTaskUseCase';
import { ListTaskActivityLogsUseCase } from '../../application/use-cases/task-activity-log/ListTaskActivityLogsUseCase';
import { param } from '../helpers/params';

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly addAssigneeUseCase: AddAssigneeUseCase,
    private readonly removeAssigneeUseCase: RemoveAssigneeUseCase,
    private readonly addTaskStatusUseCase: AddTaskStatusUseCase,
    private readonly removeTaskStatusUseCase: RemoveTaskStatusUseCase,
    private readonly setCurrentStatusUseCase: SetCurrentStatusUseCase,
    private readonly addTaskLabelUseCase: AddTaskLabelUseCase,
    private readonly removeTaskLabelUseCase: RemoveTaskLabelUseCase,
    private readonly cloneTaskUseCase: CloneTaskUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly listCommentsByTaskUseCase: ListCommentsByTaskUseCase,
    private readonly listTaskActivityLogsUseCase: ListTaskActivityLogsUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createTaskUseCase.execute({
        ...req.body,
        assignor_id: req.user!.id,
        created_by: req.user!.id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listTasksUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getTaskUseCase.execute(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.updateTaskUseCase.execute({
        id: param(req.params.id),
        ...req.body,
        updated_by: req.user!.id,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteTaskUseCase.execute({
        id: param(req.params.id),
        deleted_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  addAssignee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.addAssigneeUseCase.execute({
        task_id: param(req.params.id),
        user_id: req.body.user_id,
        performed_by: req.user!.id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  removeAssignee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.removeAssigneeUseCase.execute({
        task_id: param(req.params.id),
        user_id: param(req.params.userId),
        performed_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  addStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.addTaskStatusUseCase.execute({
        task_id: param(req.params.id),
        status_id: req.body.status_id,
        performed_by: req.user!.id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  removeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.removeTaskStatusUseCase.execute({
        task_id: param(req.params.id),
        status_id: param(req.params.statusId),
        performed_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  setCurrentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.setCurrentStatusUseCase.execute({
        task_id: param(req.params.id),
        status_id: req.body.status_id,
        updated_by: req.user!.id,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  addLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.addTaskLabelUseCase.execute({
        task_id: param(req.params.id),
        label_id: req.body.label_id,
        performed_by: req.user!.id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  removeLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.removeTaskLabelUseCase.execute({
        task_id: param(req.params.id),
        label_id: param(req.params.labelId),
        performed_by: req.user!.id,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  clone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.cloneTaskUseCase.execute({
        source_task_id: param(req.params.id),
        assignor_id: req.user!.id,
        created_by: req.user!.id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createCommentUseCase.execute({
        task_id: param(req.params.id),
        creator_id: req.user!.id,
        content: req.body.content,
        created_by: req.user!.id,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  listComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listCommentsByTaskUseCase.execute(param(req.params.id));
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  listActivityLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const includeSubtasks = req.query.includeSubtasks === 'true';
      const startDateStr = req.query.startDate as string | undefined;
      const endDateStr = req.query.endDate as string | undefined;

      const result = await this.listTaskActivityLogsUseCase.execute({
        task_id: param(req.params.id),
        page,
        limit,
        include_subtasks: includeSubtasks,
        start_date: startDateStr ? new Date(startDateStr) : undefined,
        end_date: endDateStr ? new Date(endDateStr) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
