import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { IStatusRepository } from '../../../domain/repositories/IStatusRepository';
import { AppError } from '../../../domain/errors/AppError';

interface AddTaskStatusInputDTO {
  task_id: string;
  status_id: string;
}

export class AddTaskStatusUseCase implements IUseCase<AddTaskStatusInputDTO, string[]> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly statusRepository: IStatusRepository,
  ) {}

  async execute(input: AddTaskStatusInputDTO): Promise<string[]> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const status = await this.statusRepository.findById(input.status_id);
    if (!status) {
      throw new AppError('Status not found', 404);
    }

    const currentStatuses = await this.taskRepository.getStatuses(input.task_id);
    if (currentStatuses.includes(input.status_id)) {
      throw new AppError('Status is already added to this task', 409);
    }

    await this.taskRepository.addStatus(input.task_id, input.status_id);
    return this.taskRepository.getStatuses(input.task_id);
  }
}

