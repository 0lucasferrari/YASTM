import { v4 as uuidv4 } from 'uuid';
import { IUseCase } from '../../interfaces/IUseCase';
import { UpdateTaskInputDTO, TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { ITaskActivityLogRepository } from '../../../domain/repositories/ITaskActivityLogRepository';
import { TaskAction } from '../../../domain/enums/TaskAction';
import { TaskActivityLog } from '../../../domain/entities/TaskActivityLog';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateTaskUseCase implements IUseCase<UpdateTaskInputDTO, TaskOutputDTO> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly logRepository: ITaskActivityLogRepository,
  ) {}

  async execute(input: UpdateTaskInputDTO): Promise<TaskOutputDTO> {
    const existing = await this.taskRepository.findById(input.id);
    if (!existing) {
      throw new AppError('Task not found', 404);
    }

    if (input.parent_task_id) {
      const parentTask = await this.taskRepository.findById(input.parent_task_id);
      if (!parentTask) {
        throw new AppError('Parent task not found', 404);
      }
      if (input.parent_task_id === input.id) {
        throw new AppError('A task cannot be its own parent', 400);
      }
    }

    const updated = await this.taskRepository.update(input.id, {
      title: input.title,
      description: input.description,
      parent_task_id: input.parent_task_id,
      priority: input.priority,
      predicted_finish_date: input.predicted_finish_date !== undefined
        ? (input.predicted_finish_date ? new Date(input.predicted_finish_date) : null)
        : undefined,
      updated_by: input.updated_by,
    });

    if (!updated) {
      throw new AppError('Failed to update task', 500);
    }

    // Build field-level diff logs
    const now = new Date();
    const logs: TaskActivityLog[] = [];

    const fieldsToCompare: { key: string; oldVal: string | null; newVal: string | null }[] = [];

    if (input.title !== undefined && input.title !== existing.title) {
      fieldsToCompare.push({ key: 'title', oldVal: existing.title, newVal: input.title });
    }
    if (input.description !== undefined && (input.description ?? null) !== (existing.description ?? null)) {
      fieldsToCompare.push({ key: 'description', oldVal: existing.description ?? null, newVal: input.description ?? null });
    }
    if (input.parent_task_id !== undefined && (input.parent_task_id ?? null) !== (existing.parent_task_id ?? null)) {
      fieldsToCompare.push({ key: 'parent_task_id', oldVal: existing.parent_task_id ?? null, newVal: input.parent_task_id ?? null });
    }
    if (input.priority !== undefined && (input.priority ?? null) !== (existing.priority ?? null)) {
      fieldsToCompare.push({ key: 'priority', oldVal: existing.priority ?? null, newVal: input.priority ?? null });
    }
    if (input.predicted_finish_date !== undefined) {
      const oldDate = existing.predicted_finish_date ? existing.predicted_finish_date.toISOString() : null;
      const newDate = input.predicted_finish_date ?? null;
      if (oldDate !== newDate) {
        fieldsToCompare.push({ key: 'predicted_finish_date', oldVal: oldDate, newVal: newDate });
      }
    }

    for (const diff of fieldsToCompare) {
      logs.push({
        id: uuidv4(),
        task_id: input.id,
        user_id: input.updated_by,
        action: TaskAction.TASK_UPDATED,
        field: diff.key,
        old_value: diff.oldVal,
        new_value: diff.newVal,
        created_at: now,
      });
    }

    if (logs.length > 0) {
      await this.logRepository.createMany(logs);
    }

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      parent_task_id: updated.parent_task_id,
      assignor_id: updated.assignor_id,
      current_status_id: updated.current_status_id,
      priority: updated.priority,
      predicted_finish_date: updated.predicted_finish_date,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };
  }
}
