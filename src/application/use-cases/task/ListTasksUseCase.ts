import { IUseCase } from '../../interfaces/IUseCase';
import { TaskOutputDTO } from '../../dtos/task/TaskDTO';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';

export class ListTasksUseCase implements IUseCase<void, TaskOutputDTO[]> {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(): Promise<TaskOutputDTO[]> {
    const [tasks, allAssignees] = await Promise.all([
      this.taskRepository.findAll(),
      this.taskRepository.findAllAssignees(),
    ]);

    // Build a map: taskId → user_id[]
    const assigneeMap = new Map<string, string[]>();
    for (const row of allAssignees) {
      const list = assigneeMap.get(row.task_id) ?? [];
      list.push(row.user_id);
      assigneeMap.set(row.task_id, list);
    }

    return tasks.map((task) => ({
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
  }
}

