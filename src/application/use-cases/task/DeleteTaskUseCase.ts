import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

interface DeleteTaskInputDTO {
  id: string;
  deleted_by: string;
}

export class DeleteTaskUseCase implements IUseCase<DeleteTaskInputDTO, void> {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: DeleteTaskInputDTO): Promise<void> {
    const task = await this.taskRepository.findById(input.id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    await this.taskRepository.softDelete(input.id, input.deleted_by);
  }
}

