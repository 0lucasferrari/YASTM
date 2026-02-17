import type { Task, Comment, Status, Label, User, PaginatedActivityLogs } from '../types/index.ts';

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const json = await res.json();

  if (!res.ok) {
    const message = json?.error?.message ?? 'Something went wrong';
    throw new Error(message);
  }

  return json.data as T;
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export const auth = {
  login: (body: { email: string; password: string }) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// ─── Users ──────────────────────────────────────────────────────────────────
export const users = {
  list: () => request<User[]>('/users'),
  get: (id: string) => request<User>(`/users/${id}`),
  update: (id: string, body: object) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// ─── Teams ──────────────────────────────────────────────────────────────────
export const teams = {
  list: () => request<unknown[]>('/teams'),
  get: (id: string) => request<unknown>(`/teams/${id}`),
  create: (body: object) =>
    request<unknown>('/teams', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: object) =>
    request<unknown>(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<void>(`/teams/${id}`, { method: 'DELETE' }),
};

// ─── Tasks ──────────────────────────────────────────────────────────────────
export const tasks = {
  list: () => request<Task[]>('/tasks'),
  get: (id: string) => request<Task>(`/tasks/${id}`),
  create: (body: object) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: object) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),

  // Assignees
  addAssignee: (taskId: string, userId: string) =>
    request<void>(`/tasks/${taskId}/assignees`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),
  removeAssignee: (taskId: string, userId: string) =>
    request<void>(`/tasks/${taskId}/assignees/${userId}`, { method: 'DELETE' }),

  // Status
  setCurrentStatus: (taskId: string, statusId: string) =>
    request<Task>(`/tasks/${taskId}/current-status`, {
      method: 'PUT',
      body: JSON.stringify({ status_id: statusId }),
    }),
  addStatus: (taskId: string, statusId: string) =>
    request<string[]>(`/tasks/${taskId}/statuses`, {
      method: 'POST',
      body: JSON.stringify({ status_id: statusId }),
    }),
  removeStatus: (taskId: string, statusId: string) =>
    request<void>(`/tasks/${taskId}/statuses/${statusId}`, { method: 'DELETE' }),

  // Comments
  listComments: (taskId: string) =>
    request<Comment[]>(`/tasks/${taskId}/comments`),
  addComment: (taskId: string, content: string) =>
    request<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Clone
  clone: (taskId: string) =>
    request<Task>(`/tasks/${taskId}/clone`, { method: 'POST' }),

  // Activity Logs
  activityLogs: (taskId: string, page = 1, limit = 20, includeSubtasks = false, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      includeSubtasks: String(includeSubtasks),
    });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return request<PaginatedActivityLogs>(`/tasks/${taskId}/activity-logs?${params.toString()}`);
  },
};

// ─── Statuses ───────────────────────────────────────────────────────────────
export const statuses = {
  list: () => request<Status[]>('/statuses'),
  get: (id: string) => request<Status>(`/statuses/${id}`),
  create: (body: object) =>
    request<Status>('/statuses', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: object) =>
    request<Status>(`/statuses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<void>(`/statuses/${id}`, { method: 'DELETE' }),
};

// ─── Labels ─────────────────────────────────────────────────────────────────
export const labels = {
  list: () => request<Label[]>('/labels'),
  get: (id: string) => request<Label>(`/labels/${id}`),
  create: (body: object) =>
    request<Label>('/labels', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: object) =>
    request<Label>(`/labels/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<void>(`/labels/${id}`, { method: 'DELETE' }),
};

// ─── Reports (public — no auth required) ────────────────────────────────────
export interface TaskReportData {
  rootTask: Task;
  allTasks: Task[];
  statuses: { id: string; title: string }[];
  users: { id: string; name: string }[];
}

export const reports = {
  getTaskReport: (taskId: string) =>
    request<TaskReportData>(`/reports/tasks/${taskId}`),
};

// ─── Comments ───────────────────────────────────────────────────────────────
export const comments = {
  get: (id: string) => request<Comment>(`/comments/${id}`),
  update: (id: string, body: object) =>
    request<Comment>(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<void>(`/comments/${id}`, { method: 'DELETE' }),
};
