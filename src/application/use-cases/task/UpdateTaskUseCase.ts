import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateTaskInputDTO, TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateTaskUseCase implements IUseCase<UpdateTaskInputDTO, TaskOutputDTO> {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: UpdateTaskInputDTO): Promise<TaskOutputDTO> {
    const existing = await this.taskRepository.findById(input.id);
    if (!existing) {
      throw new AppError('Task not found', 404);
    }

    if (input.parent_task_id) {
      const parentTask = await this.taskRepository.findById(input.parent_task_id);
      if (!parentTask) {
        throw new AppError('Parent task not found', 404);
      }
      if (input.parent_task_id === input.id) {
        throw new AppError('A task cannot be its own parent', 400);
      }
    }

    const updated = await this.taskRepository.update(input.id, {
      title: input.title,
      description: input.description,
      parent_task_id: input.parent_task_id,
      priority: input.priority,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update task', 500);
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

