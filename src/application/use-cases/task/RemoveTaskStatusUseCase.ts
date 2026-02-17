import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

interface RemoveTaskStatusInputDTO {
  task_id: string;
  status_id: string;
  performed_by: string;
}

export class RemoveTaskStatusUseCase implements IUseCase<RemoveTaskStatusInputDTO, void> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: RemoveTaskStatusInputDTO): Promise<void> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const currentStatuses = await this.taskRepository.getStatuses(input.task_id);
    if (!currentStatuses.includes(input.status_id)) {
      throw new AppError('Status is not assigned to this task', 404);
    }

    // If the current status is being removed from possible statuses, clear it
    if (task.current_status_id === input.status_id) {
      await this.taskRepository.update(input.task_id, { current_status_id: null });
    }

    await this.taskRepository.removeStatus(input.task_id, input.status_id);

    await this.logRepository.create({
      id: uuidv4(),
      task_id: input.task_id,
      user_id: input.performed_by,
      action: TaskAction.STATUS_REMOVED,
      field: null,
      old_value: input.status_id,
      new_value: null,
      created_at: new Date(),
    });
  }
}
