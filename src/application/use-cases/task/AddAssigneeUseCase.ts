import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AppError } from '../../../domain/errors/AppError';

interface AddAssigneeInputDTO {
  task_id: string;
  user_id: string;
}

export class AddAssigneeUseCase implements IUseCase<AddAssigneeInputDTO, string[]> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly userRepository: IUserRepository,
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
    return this.taskRepository.getAssignees(input.task_id);
  }
}

