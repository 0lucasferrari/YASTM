import { Knex } from 'knex';
import { TaskActivityLog } from '../../domain/entities/TaskActivityLog';
import { ActivityLogDateFilter, ITaskActivityLogRepository } from '../../domain/repositories/ITaskActivityLogRepository';

/** Remove undefined values so Knex doesn't pass them as DEFAULT (breaks MySQL for required fields) */
function sanitizeLog(log: TaskActivityLog): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(log)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export class KnexTaskActivityLogRepository implements ITaskActivityLogRepository {
  constructor(private readonly db: Knex) {}

  async create(log: TaskActivityLog): Promise<void> {
    if (log.task_id == null || log.task_id === '') {
      throw new Error('TaskActivityLog requires a valid task_id');
    }
    await this.db('task_activity_logs').insert(sanitizeLog(log));
  }

  async createMany(logs: TaskActivityLog[]): Promise<void> {
    if (logs.length === 0) return;
    for (const log of logs) {
      if (log.task_id == null || log.task_id === '') {
        throw new Error('TaskActivityLog requires a valid task_id');
      }
    }
    await this.db('task_activity_logs').insert(logs.map(sanitizeLog));
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

