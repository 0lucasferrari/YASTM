import { IUseCase } from '../../interfaces/IUseCase';
import {
  ListTaskActivityLogsInputDTO,
  PaginatedTaskActivityLogsOutputDTO,
} from '../../dtos/task-activity-log/TaskActivityLogDTO';
import { ITaskActivityLogRepository, ActivityLogDateFilter } from '../../../domain/repositories/ITaskActivityLogRepository';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { AppError } from '../../../domain/errors/AppError';

export class ListTaskActivityLogsUseCase
  implements IUseCase<ListTaskActivityLogsInputDTO, PaginatedTaskActivityLogsOutputDTO>
{
  constructor(
    private readonly logRepository: ITaskActivityLogRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(input: ListTaskActivityLogsInputDTO): Promise<PaginatedTaskActivityLogsOutputDTO> {
    const task = await this.taskRepository.findById(input.task_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const dateFilter: ActivityLogDateFilter = {
      startDate: input.start_date,
      endDate: input.end_date,
    };

    let items;
    let total;

    if (input.include_subtasks) {
      // Collect all descendant task IDs recursively
      const allTasks = await this.taskRepository.findAll();
      const taskIds = this.collectDescendantIds(input.task_id, allTasks);

      [items, total] = await Promise.all([
        this.logRepository.findByTaskIds(taskIds, input.page, input.limit, dateFilter),
        this.logRepository.countByTaskIds(taskIds, dateFilter),
      ]);
    } else {
      [items, total] = await Promise.all([
        this.logRepository.findByTaskId(input.task_id, input.page, input.limit, dateFilter),
        this.logRepository.countByTaskId(input.task_id, dateFilter),
      ]);
    }

    return {
      items: items.map((log) => ({
        id: log.id,
        task_id: log.task_id,
        user_id: log.user_id,
        action: log.action,
        field: log.field,
        old_value: log.old_value,
        new_value: log.new_value,
        created_at: log.created_at,
      })),
      total,
      page: input.page,
      totalPages: Math.ceil(total / input.limit),
    };
  }

  /**
   * Build a list of the root task ID plus all its descendant task IDs.
   */
  private collectDescendantIds(
    rootId: string,
    allTasks: { id: string; parent_task_id: string | null }[],
  ): string[] {
    const childrenMap = new Map<string, string[]>();
    for (const t of allTasks) {
      if (t.parent_task_id) {
        const list = childrenMap.get(t.parent_task_id) ?? [];
        list.push(t.id);
        childrenMap.set(t.parent_task_id, list);
      }
    }

    const result: string[] = [];
    const stack = [rootId];
    while (stack.length > 0) {
      const id = stack.pop()!;
      result.push(id);
      const children = childrenMap.get(id);
      if (children) {
        stack.push(...children);
      }
    }
    return result;
  }
}
