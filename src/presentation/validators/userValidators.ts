import { z } from 'zod/v4';

export const uuidParamSchema = z.object({
  id: z.uuid('Invalid UUID'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  team_id: z.uuid().nullable().optional(),
});

