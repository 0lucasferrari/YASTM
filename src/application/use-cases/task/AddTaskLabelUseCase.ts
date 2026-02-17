import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { ILabelRepository } from '../../../domain/repositories/ILabelRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

interface AddTaskLabelInputDTO {
  task_id: string;
  label_id: string;
  performed_by: string;
}

export class AddTaskLabelUseCase implements IUseCase<AddTaskLabelInputDTO, string[]> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly labelRepository: ILabelRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: AddTaskLabelInputDTO): Promise<string[]> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const label = await this.labelRepository.findById(input.label_id);
    if (!label) {
      throw new AppError('Label not found', 404);
    }

    const currentLabels = await this.taskRepository.getLabels(input.task_id);
    if (currentLabels.includes(input.label_id)) {
      throw new AppError('Label is already added to this task', 409);
    }

    await this.taskRepository.addLabel(input.task_id, input.label_id);

    await this.logRepository.create({
      id: uuidv4(),
      task_id: input.task_id,
      user_id: input.performed_by,
      action: TaskAction.LABEL_ADDED,
      field: null,
      old_value: null,
      new_value: input.label_id,
      created_at: new Date(),
    });

    return this.taskRepository.getLabels(input.task_id);
  }
}
