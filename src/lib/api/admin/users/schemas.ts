import { z } from 'zod';

import { updatableUserStatuses } from './types';

export const updateUserStatusSchema = z.object({
  status: z.enum(updatableUserStatuses),
});

export type UpdateUserStatusSchema = z.infer<typeof updateUserStatusSchema>;
