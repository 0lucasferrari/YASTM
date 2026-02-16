import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

interface RemoveTaskLabelInputDTO {
  task_id: string;
  label_id: string;
}

export class RemoveTaskLabelUseCase implements IUseCase<RemoveTaskLabelInputDTO, void> {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(input: RemoveTaskLabelInputDTO): Promise<void> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const currentLabels = await this.taskRepository.getLabels(input.task_id);
    if (!currentLabels.includes(input.label_id)) {
      throw new AppError('Label is not on this task', 404);
    }

    await this.taskRepository.removeLabel(input.task_id, input.label_id);
  }
}

