import { z } from 'zod/v4';

export const createStatusSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
});

export const updateStatusSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

