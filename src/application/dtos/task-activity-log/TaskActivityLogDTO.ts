import { TaskAction } from '../../../domain/enums/TaskAction';

export interface TaskActivityLogOutputDTO {
  id: string;
  task_id: string;
  user_id: string;
  action: TaskAction;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: Date;
}

export interface ListTaskActivityLogsInputDTO {
  task_id: string;
  page: number;
  limit: number;
  include_subtasks?: boolean;
  start_date?: Date;
  end_date?: Date;
}

export interface PaginatedTaskActivityLogsOutputDTO {
  items: TaskActivityLogOutputDTO[];
  total: number;
  page: number;
  totalPages: number;
}

