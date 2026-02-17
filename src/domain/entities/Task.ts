import { Priority } from '../enums/Priority';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  parent_task_id: string | null;
  assignor_id: string;
  current_status_id: string | null;
  priority: Priority | null;
  predicted_finish_date: Date | null;
  created_at: Date;
  created_by: string | null;
  updated_at: Date;
  updated_by: string | null;
  deleted_at: Date | null;
  deleted_by: string | null;
}

