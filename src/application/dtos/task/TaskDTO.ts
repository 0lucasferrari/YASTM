import { Priority } from '../../../domain/enums/Priority';

export interface CreateTaskInputDTO {
  title: string;
  description?: string | null;
  parent_task_id?: string | null;
  priority?: Priority | null;
  predicted_finish_date?: string | null;
  assignor_id: string;
  created_by: string;
}

export interface UpdateTaskInputDTO {
  id: string;
  title?: string;
  description?: string | null;
  parent_task_id?: string | null;
  priority?: Priority | null;
  predicted_finish_date?: string | null;
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
  predicted_finish_date: Date | null;
  created_at: Date;
  updated_at: Date;
  possible_status_ids?: string[];
  assignee_ids?: string[];
  label_ids?: string[];
}

