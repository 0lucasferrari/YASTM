import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

interface CloneTaskInputDTO {
  source_task_id: string;
  assignor_id: string;
  created_by: string;
}

export class CloneTaskUseCase implements IUseCase<CloneTaskInputDTO, TaskOutputDTO> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: CloneTaskInputDTO): Promise<TaskOutputDTO> {
    const source = await this.taskRepository.findById(input.source_task_id);
    if (!source) {
      throw new AppError('Source task not found', 404);
    }

    // Create a new task with the same structure
    const newTask = await this.taskRepository.create({
      id: uuidv4(),
      title: `${source.title} (Copy)`,
      description: source.description,
      parent_task_id: source.parent_task_id,
      assignor_id: input.assignor_id,
      current_status_id: null,
      priority: source.priority,
      predicted_finish_date: source.predicted_finish_date,
      created_by: input.created_by,
      updated_by: input.created_by,
    });

    // Copy possible statuses from source task
    const possibleStatusIds = await this.taskRepository.getStatuses(input.source_task_id);
    for (const statusId of possibleStatusIds) {
      await this.taskRepository.addStatus(newTask.id, statusId);
    }

    // Log the clone on the source task
    await this.logRepository.create({
      id: uuidv4(),
      task_id: input.source_task_id,
      user_id: input.created_by,
      action: TaskAction.TASK_CLONED,
      field: null,
      old_value: null,
      new_value: newTask.id,
      created_at: new Date(),
    });

    // Also log creation on the new task
    await this.logRepository.create({
      id: uuidv4(),
      task_id: newTask.id,
      user_id: input.created_by,
      action: TaskAction.TASK_CREATED,
      field: null,
      old_value: null,
      new_value: null,
      created_at: new Date(),
    });

    return {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      parent_task_id: newTask.parent_task_id,
      assignor_id: newTask.assignor_id,
      current_status_id: newTask.current_status_id,
      priority: newTask.priority,
      predicted_finish_date: newTask.predicted_finish_date,
      created_at: newTask.created_at,
      updated_at: newTask.updated_at,
      possible_status_ids: possibleStatusIds,
      assignee_ids: [],
      label_ids: [],
    };
  }
}
