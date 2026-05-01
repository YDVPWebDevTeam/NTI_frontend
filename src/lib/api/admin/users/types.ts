import type { UserRole } from '../auth/types';
import { UserAccountStatus } from '../types';

export const updatableUserStatuses = [
  UserAccountStatus.ACTIVE,
  UserAccountStatus.SUSPENDED,
] as const;
export type UpdatableUserStatus = (typeof updatableUserStatuses)[number];

export type AdminUserRole = UserRole;

export interface AdminUser {
  id: string;
  email: string;
  role: AdminUserRole;
  status: UserAccountStatus;
}

export interface UpdateUserStatusRequest {
  status: UpdatableUserStatus;
}
