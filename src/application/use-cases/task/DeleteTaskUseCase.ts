import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { AppError } from '../../../domain/errors/AppError';

interface DeleteTaskInputDTO {
  id: string;
  deleted_by: string;
}

export class DeleteTaskUseCase implements IUseCase<DeleteTaskInputDTO, void> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: DeleteTaskInputDTO): Promise<void> {
    const task = await this.taskRepository.findById(input.id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    await this.taskRepository.softDelete(input.id, input.deleted_by);

    await this.logRepository.create({
      id: uuidv4(),
      task_id: input.id,
      user_id: input.deleted_by,
      action: TaskAction.TASK_DELETED,
      field: null,
      old_value: null,
      new_value: null,
      created_at: new Date(),
    });
  }
}
