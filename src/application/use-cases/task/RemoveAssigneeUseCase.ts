import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

interface RemoveAssigneeInputDTO {
  task_id: string;
  user_id: string;
  performed_by: string;
}

export class RemoveAssigneeUseCase implements IUseCase<RemoveAssigneeInputDTO, void> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: RemoveAssigneeInputDTO): Promise<void> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const currentAssignees = await this.taskRepository.getAssignees(input.task_id);
    if (!currentAssignees.includes(input.user_id)) {
      throw new AppError('User is not assigned to this task', 404);
    }

    await this.taskRepository.removeAssignee(input.task_id, input.user_id);

    await this.logRepository.create({
      id: uuidv4(),
      task_id: input.task_id,
      user_id: input.performed_by,
      action: TaskAction.ASSIGNEE_REMOVED,
      field: null,
      old_value: input.user_id,
      new_value: null,
      created_at: new Date(),
    });
  }
}
