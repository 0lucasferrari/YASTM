import { Priority } from '../../../domain/enums/Priority';

export interface CreateTaskInputDTO {
  title: string;
  description?: string | null;
  parent_task_id?: string | null;
  priority?: Priority | null;
  assignor_id: string;
  created_by: string;
}

export interface UpdateTaskInputDTO {
  id: string;
  title?: string;
  description?: string | null;
  parent_task_id?: string | null;
  priority?: Priority | null;
  updated_by: string;
}

export interface TaskOutputDTO {
  id: string;
  title: string;
  description: string | null;
  parent_task_id: string | null;
  assignor_id: string;
  current_status_id: string | null;
  priority: Priority | null;
  created_at: Date;
  updated_at: Date;
}

