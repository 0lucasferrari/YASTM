export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  team_id: string | null;
  created_at: Date;
  created_by: string | null;
  updated_at: Date;
  updated_by: string | null;
  deleted_at: Date | null;
  deleted_by: string | null;
}

