// ─── API envelope ───────────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string; statusCode: number };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Entities ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  parent_task_id: string | null;
  assignor_id: string;
  current_status_id: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  predicted_finish_date: string | null;
  created_at: string;
  updated_at: string;
  // Enriched fields returned by GET /tasks/:id
  possible_status_ids?: string[];
  assignee_ids?: string[];
  label_ids?: string[];
}

export interface Status {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  creator_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface PaginatedActivityLogs {
  items: TaskActivityLog[];
  total: number;
  page: number;
  totalPages: number;
}

