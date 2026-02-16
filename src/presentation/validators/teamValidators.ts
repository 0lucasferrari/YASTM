import { z } from 'zod/v4';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
});

