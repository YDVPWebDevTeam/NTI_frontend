import { z } from 'zod';

import { UserRole } from '../auth/types';

export const createSystemInviteSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  roleToAssign: z.nativeEnum(UserRole),
});

export type CreateSystemInviteSchema = z.infer<typeof createSystemInviteSchema>;
