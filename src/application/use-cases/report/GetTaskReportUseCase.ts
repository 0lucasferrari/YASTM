import { IUseCase } from '../../interfaces/IUseCase';
import { TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { IStatusRepository } from '../../../domain/repositories/IStatusRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AppError } from '../../../domain/errors/AppError';

export interface TaskReportOutputDTO {
  rootTask: TaskOutputDTO;
  allTasks: TaskOutputDTO[];
  statuses: { id: string; title: string }[];
  users: { id: string; name: string }[];
}

export class GetTaskReportUseCase implements IUseCase<string, TaskReportOutputDTO> {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly statusRepository: IStatusRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(taskId: string): Promise<TaskReportOutputDTO> {
    const rootTask = await this.taskRepository.findById(taskId);
    if (!rootTask) {
      throw new AppError('Task not found', 404);
    }

    const [allRawTasks, allAssignees, allStatuses, allUsers, rootAssignees] = await Promise.all([
      this.taskRepository.findAll(),
      this.taskRepository.findAllAssignees(),
      this.statusRepository.findAll(),
      this.userRepository.findAll(),
      this.taskRepository.getAssignees(taskId),
    ]);

    // Build assignee map
    const assigneeMap = new Map<string, string[]>();
    for (const row of allAssignees) {
      const list = assigneeMap.get(row.task_id) ?? [];
      list.push(row.user_id);
      assigneeMap.set(row.task_id, list);
    }

    const allTasks: TaskOutputDTO[] = allRawTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      parent_task_id: task.parent_task_id,
      assignor_id: task.assignor_id,
      current_status_id: task.current_status_id,
      priority: task.priority,
      predicted_finish_date: task.predicted_finish_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
      assignee_ids: assigneeMap.get(task.id) ?? [],
    }));

    const enrichedRoot: TaskOutputDTO = {
      id: rootTask.id,
      title: rootTask.title,
      description: rootTask.description,
      parent_task_id: rootTask.parent_task_id,
      assignor_id: rootTask.assignor_id,
      current_status_id: rootTask.current_status_id,
      priority: rootTask.priority,
      predicted_finish_date: rootTask.predicted_finish_date,
      created_at: rootTask.created_at,
      updated_at: rootTask.updated_at,
      assignee_ids: rootAssignees,
    };

    return {
      rootTask: enrichedRoot,
      allTasks,
      statuses: allStatuses.map((s) => ({ id: s.id, title: s.title })),
      users: allUsers.map((u) => ({ id: u.id, name: u.name })),
    };
  }
}

