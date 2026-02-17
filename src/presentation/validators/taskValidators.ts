import { z } from 'zod/v4';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  parent_task_id: z.uuid().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable().optional(),
  predicted_finish_date: z.iso.datetime().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  parent_task_id: z.uuid().nullable().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).nullable().optional(),
  predicted_finish_date: z.iso.datetime().nullable().optional(),
});

export const addAssigneeSchema = z.object({
  user_id: z.uuid('Invalid user ID'),
});

export const addStatusSchema = z.object({
  status_id: z.uuid('Invalid status ID'),
});

export const setCurrentStatusSchema = z.object({
  status_id: z.uuid('Invalid status ID'),
});

export const addLabelSchema = z.object({
  label_id: z.uuid('Invalid label ID'),
});

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export const taskIdParamSchema = z.object({
  id: z.uuid('Invalid task UUID'),
});

export const taskAssigneeParamSchema = z.object({
  id: z.uuid('Invalid task UUID'),
  userId: z.uuid('Invalid user UUID'),
});

export const taskLabelParamSchema = z.object({
  id: z.uuid('Invalid task UUID'),
  labelId: z.uuid('Invalid label UUID'),
});

export const taskStatusParamSchema = z.object({
  id: z.uuid('Invalid task UUID'),
  statusId: z.uuid('Invalid status UUID'),
});

export const activityLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  includeSubtasks: z.coerce.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

