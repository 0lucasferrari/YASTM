import { z } from 'zod/v4';

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

