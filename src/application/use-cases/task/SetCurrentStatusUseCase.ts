import { IUseCase } from '../../interfaces/IUseCase';
import { TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

interface SetCurrentStatusInputDTO {
  task_id: string;
  status_id: string;
  updated_by: string;
}

export class SetCurrentStatusUseCase implements IUseCase<SetCurrentStatusInputDTO, TaskOutputDTO> {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: SetCurrentStatusInputDTO): Promise<TaskOutputDTO> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const possibleStatuses = await this.taskRepository.getStatuses(input.task_id);
    if (!possibleStatuses.includes(input.status_id)) {
      throw new AppError('Status is not in the task\'s possible statuses. Add it first.', 400);
    }

    const updated = await this.taskRepository.update(input.task_id, {
      current_status_id: input.status_id,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update task status', 500);
    }

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      parent_task_id: updated.parent_task_id,
      assignor_id: updated.assignor_id,
      current_status_id: updated.current_status_id,
      priority: updated.priority,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}

