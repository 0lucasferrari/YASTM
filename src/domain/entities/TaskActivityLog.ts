import { TaskAction } from '../enums/TaskAction';

export interface TaskActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: TaskAction;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: Date;
}

