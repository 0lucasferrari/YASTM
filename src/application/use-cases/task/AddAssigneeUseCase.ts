import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

interface AddAssigneeInputDTO {
  task_id: string;
  user_id: string;
  performed_by: string;
}

export class AddAssigneeUseCase implements IUseCase<AddAssigneeInputDTO, string[]> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: AddAssigneeInputDTO): Promise<string[]> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const user = await this.userRepository.findById(input.user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const currentAssignees = await this.taskRepository.getAssignees(input.task_id);
    if (currentAssignees.includes(input.user_id)) {
      throw new AppError('User is already assigned to this task', 409);
    }

    await this.taskRepository.addAssignee(input.task_id, input.user_id);

    await this.logRepository.create({
      id: uuidv4(),
      task_id: input.task_id,
      user_id: input.performed_by,
      action: TaskAction.ASSIGNEE_ADDED,
      field: null,
      old_value: null,
      new_value: input.user_id,
      created_at: new Date(),
    });

    return this.taskRepository.getAssignees(input.task_id);
  }
}
