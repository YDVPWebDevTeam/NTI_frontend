'use client';

import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { UserRole, adminCreateSystemInvite } from 'lib/api';

export const systemInviteRoles = [UserRole.ADMIN, UserRole.MENTOR, UserRole.EVALUATOR] as const;

export const createSystemInviteSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  roleToAssign: z.enum(systemInviteRoles),
});

export type CreateSystemInviteSchema = z.infer<typeof createSystemInviteSchema>;

export function useCreateSystemInvite() {
  return useMutation({
    mutationFn: (payload: CreateSystemInviteSchema) => adminCreateSystemInvite(payload),
  });
}
