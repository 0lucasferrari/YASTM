export interface Comment {
  id: string;
  task_id: string;
  creator_id: string;
  content: string;
  created_at: Date;
  created_by: string | null;
  updated_at: Date;
  updated_by: string | null;
  deleted_at: Date | null;
  deleted_by: string | null;
}

