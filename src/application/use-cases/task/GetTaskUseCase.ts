import { IUseCase } from '../../interfaces/IUseCase';
import { TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

export class GetTaskUseCase implements IUseCase<string, TaskOutputDTO> {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<TaskOutputDTO> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      parent_task_id: task.parent_task_id,
      assignor_id: task.assignor_id,
      current_status_id: task.current_status_id,
      priority: task.priority,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }
}

