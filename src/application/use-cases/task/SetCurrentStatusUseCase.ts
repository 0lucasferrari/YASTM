import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

interface SetCurrentStatusInputDTO {
  task_id: string;
  status_id: string;
  updated_by: string;
}

export class SetCurrentStatusUseCase implements IUseCase<SetCurrentStatusInputDTO, TaskOutputDTO> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: SetCurrentStatusInputDTO): Promise<TaskOutputDTO> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const possibleStatuses = await this.taskRepository.getStatuses(input.task_id);
    if (!possibleStatuses.includes(input.status_id)) {
      throw new AppError('Status is not in the task\'s possible statuses. Add it first.', 400);
    }

    const oldStatusId = task.current_status_id;

    const updated = await this.taskRepository.update(input.task_id, {
      current_status_id: input.status_id,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update task status', 500);
    }

    await this.logRepository.create({
      id: uuidv4(),
      task_id: input.task_id,
      user_id: input.updated_by,
      action: TaskAction.CURRENT_STATUS_CHANGED,
      field: 'current_status_id',
      old_value: oldStatusId ?? null,
      new_value: input.status_id,
      created_at: new Date(),
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      parent_task_id: updated.parent_task_id,
      assignor_id: updated.assignor_id,
      current_status_id: updated.current_status_id,
      priority: updated.priority,
      predicted_finish_date: updated.predicted_finish_date,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}
