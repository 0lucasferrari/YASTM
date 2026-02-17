import { Task } from '../entities/Task';
import { Priority } from '../enums/Priority';

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  create(task: Omit<Task, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Task>;
  update(id: string, data: Partial<Pick<Task, 'title' | 'description' | 'parent_task_id' | 'current_status_id' | 'priority' | 'predicted_finish_date' | 'updated_by'>>): Promise<Task | null>;
  softDelete(id: string, deletedBy: string): Promise<void>;

  // Assignee management
  addAssignee(taskId: string, userId: string): Promise<void>;
  removeAssignee(taskId: string, userId: string): Promise<void>;
  getAssignees(taskId: string): Promise<string[]>;

  // Status management
  addStatus(taskId: string, statusId: string): Promise<void>;
  removeStatus(taskId: string, statusId: string): Promise<void>;
  getStatuses(taskId: string): Promise<string[]>;

  // Bulk queries (for list enrichment)
  findAllAssignees(): Promise<{ task_id: string; user_id: string }[]>;

  // Label management
  addLabel(taskId: string, labelId: string): Promise<void>;
  removeLabel(taskId: string, labelId: string): Promise<void>;
  getLabels(taskId: string): Promise<string[]>;
}

export { Priority };

