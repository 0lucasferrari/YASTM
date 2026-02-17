import { TaskActivityLog } from '../entities/TaskActivityLog';

export interface ActivityLogDateFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface ITaskActivityLogRepository {
  create(log: TaskActivityLog): Promise<void>;
  createMany(logs: TaskActivityLog[]): Promise<void>;
  findByTaskId(taskId: string, page: number, limit: number, dateFilter?: ActivityLogDateFilter): Promise<TaskActivityLog[]>;
  countByTaskId(taskId: string, dateFilter?: ActivityLogDateFilter): Promise<number>;
  findByTaskIds(taskIds: string[], page: number, limit: number, dateFilter?: ActivityLogDateFilter): Promise<TaskActivityLog[]>;
  countByTaskIds(taskIds: string[], dateFilter?: ActivityLogDateFilter): Promise<number>;
}

