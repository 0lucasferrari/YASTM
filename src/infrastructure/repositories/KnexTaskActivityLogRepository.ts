import { Knex } from 'knex';
import { TaskActivityLog } from '../../domain/entities/TaskActivityLog';
import { ActivityLogDateFilter, ITaskActivityLogRepository } from '../../domain/repositories/ITaskActivityLogRepository';

export class KnexTaskActivityLogRepository implements ITaskActivityLogRepository {
  constructor(private readonly db: Knex) {}

  async create(log: TaskActivityLog): Promise<void> {
    await this.db('task_activity_logs').insert(log);
  }

  async createMany(logs: TaskActivityLog[]): Promise<void> {
    if (logs.length === 0) return;
    await this.db('task_activity_logs').insert(logs);
  }

  private applyDateFilter(query: Knex.QueryBuilder, dateFilter?: ActivityLogDateFilter): Knex.QueryBuilder {
    if (dateFilter?.startDate) {
      query = query.where('created_at', '>=', dateFilter.startDate);
    }
    if (dateFilter?.endDate) {
      query = query.where('created_at', '<=', dateFilter.endDate);
    }
    return query;
  }

  async findByTaskId(taskId: string, page: number, limit: number, dateFilter?: ActivityLogDateFilter): Promise<TaskActivityLog[]> {
    const offset = (page - 1) * limit;
    let query = this.db('task_activity_logs')
      .where({ task_id: taskId });
    query = this.applyDateFilter(query, dateFilter);
    return query.orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async countByTaskId(taskId: string, dateFilter?: ActivityLogDateFilter): Promise<number> {
    let query = this.db('task_activity_logs')
      .where({ task_id: taskId });
    query = this.applyDateFilter(query, dateFilter);
    const result = await query.count('id as count').first();
    return Number(result?.count ?? 0);
  }

  async findByTaskIds(taskIds: string[], page: number, limit: number, dateFilter?: ActivityLogDateFilter): Promise<TaskActivityLog[]> {
    if (taskIds.length === 0) return [];
    const offset = (page - 1) * limit;
    let query = this.db('task_activity_logs')
      .whereIn('task_id', taskIds);
    query = this.applyDateFilter(query, dateFilter);
    return query.orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async countByTaskIds(taskIds: string[], dateFilter?: ActivityLogDateFilter): Promise<number> {
    if (taskIds.length === 0) return 0;
    let query = this.db('task_activity_logs')
      .whereIn('task_id', taskIds);
    query = this.applyDateFilter(query, dateFilter);
    const result = await query.count('id as count').first();
    return Number(result?.count ?? 0);
  }
}

