import { IUseCase } from '../../interfaces/IUseCase';
import { TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';

export class ListTasksUseCase implements IUseCase<void, TaskOutputDTO[]> {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<TaskOutputDTO[]> {
    const tasks = await this.taskRepository.findAll();
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      parent_task_id: task.parent_task_id,
      assignor_id: task.assignor_id,
      current_status_id: task.current_status_id,
      priority: task.priority,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));
  }
}

