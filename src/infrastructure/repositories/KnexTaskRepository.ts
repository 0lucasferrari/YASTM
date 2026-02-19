import { Knex } from 'knex';
import { Task } from '../../domain/entities/Task';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';

export class KnexTaskRepository implements ITaskRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<Task | null> {
    const task = await this.db('tasks')
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return task || null;
  }

  async findAll(): Promise<Task[]> {
    return this.db('tasks').whereNull('deleted_at');
  }

  async create(task: Omit<Task, 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>): Promise<Task> {
    const [created] = await this.db('tasks')
      .insert(task)
      .returning('*');
    return created;
  }

  async update(
    id: string,
    data: Partial<Pick<Task, 'title' | 'description' | 'parent_task_id' | 'current_status_id' | 'priority' | 'predicted_finish_date' | 'updated_by'>>,
  ): Promise<Task | null> {
    const [updated] = await this.db('tasks')
      .where({ id })
      .whereNull('deleted_at')
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    return updated || null;
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.db('tasks')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
      });
  }

  // Assignee management
  async addAssignee(taskId: string, userId: string): Promise<void> {
    await this.db('task_assignees').insert({ task_id: taskId, user_id: userId });
  }

  async removeAssignee(taskId: string, userId: string): Promise<void> {
    await this.db('task_assignees')
      .where({ task_id: taskId, user_id: userId })
      .delete();
  }

  async getAssignees(taskId: string): Promise<string[]> {
    const rows = await this.db('task_assignees')
      .where({ task_id: taskId })
      .select('user_id');
    return rows.map((row: { user_id: string }) => row.user_id);
  }

  // Status management
  async addStatus(taskId: string, statusId: string): Promise<void> {
    await this.db('task_statuses').insert({ task_id: taskId, status_id: statusId });
  }

  async removeStatus(taskId: string, statusId: string): Promise<void> {
    await this.db('task_statuses')
      .where({ task_id: taskId, status_id: statusId })
      .delete();
  }

  async getStatuses(taskId: string): Promise<string[]> {
    const rows = await this.db('task_statuses')
      .where({ task_id: taskId })
      .select('status_id');
    return rows.map((row: { status_id: string }) => row.status_id);
  }

  // Bulk queries (for list enrichment)
  async findAllAssignees(): Promise<{ task_id: string; user_id: string }[]> {
    return this.db('task_assignees').select('task_id', 'user_id');
  }

  // Label management
  async addLabel(taskId: string, labelId: string): Promise<void> {
    await this.db('task_labels').insert({ task_id: taskId, label_id: labelId });
  }

  async removeLabel(taskId: string, labelId: string): Promise<void> {
    await this.db('task_labels')
      .where({ task_id: taskId, label_id: labelId })
      .delete();
  }

  async getLabels(taskId: string): Promise<string[]> {
    const rows = await this.db('task_labels')
      .where({ task_id: taskId })
      .select('label_id');
    return rows.map((row: { label_id: string }) => row.label_id);
  }
}

