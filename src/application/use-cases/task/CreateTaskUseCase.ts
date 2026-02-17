import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { CreateTaskInputDTO, TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

export class CreateTaskUseCase implements IUseCase<CreateTaskInputDTO, TaskOutputDTO> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: CreateTaskInputDTO): Promise<TaskOutputDTO> {
    const assignor = await this.userRepository.findById(input.assignor_id);
    if (!assignor) {
      throw new AppError('Assignor not found', 404);
    }

    if (input.parent_task_id) {
      const parentTask = await this.taskRepository.findById(input.parent_task_id);
      if (!parentTask) {
        throw new AppError('Parent task not found', 404);
      }
    }

    const task = await this.taskRepository.create({
      id: uuidv4(),
      title: input.title,
      description: input.description ?? null,
      parent_task_id: input.parent_task_id ?? null,
      assignor_id: input.assignor_id,
      current_status_id: null,
      priority: input.priority ?? null,
      predicted_finish_date: input.predicted_finish_date ? new Date(input.predicted_finish_date) : null,
      created_by: input.created_by,
      updated_by: input.created_by,
    });

    await this.logRepository.create({
      id: uuidv4(),
      task_id: task.id,
      user_id: input.created_by,
      action: TaskAction.TASK_CREATED,
      field: null,
      old_value: null,
      new_value: null,
      created_at: new Date(),
    });

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      parent_task_id: task.parent_task_id,
      assignor_id: task.assignor_id,
      current_status_id: task.current_status_id,
      priority: task.priority,
      predicted_finish_date: task.predicted_finish_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }
}
