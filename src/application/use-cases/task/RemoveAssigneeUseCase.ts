import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

interface RemoveAssigneeInputDTO {
  task_id: string;
  user_id: string;
}

export class RemoveAssigneeUseCase implements IUseCase<RemoveAssigneeInputDTO, void> {
  constructor(private readonly taskRepository: ITaskRepository) {}

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
  }
}

