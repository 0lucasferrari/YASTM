import { z } from 'zod/v4';

export const createLabelSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
});

export const updateLabelSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

