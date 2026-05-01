import { type UserRole, userRoles } from '../auth/types';
import { type InviteStatus } from '../types';

export const systemInviteRoles = [...userRoles] as const;
export type SystemInviteRole = (typeof systemInviteRoles)[number];

export interface CreateSystemInviteRequest {
  email: string;
  roleToAssign: SystemInviteRole;
}

export interface SystemInvite {
  id: string;
  email: string;
  roleToAssign: UserRole;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
}
