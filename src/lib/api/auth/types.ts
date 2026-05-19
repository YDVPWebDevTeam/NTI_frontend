import { type UserRole } from 'lib/api/admin/auth';
import { type UserAccountStatus } from 'lib/api/admin/types';

export type AuthRole = UserRole | (string & {});

export enum PendingAuthStatus {
  PENDING = 'PENDING',
}

export type AuthStatus = UserAccountStatus | PendingAuthStatus | (string & {});

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
  refreshTokenId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterViaInviteRequest {
  firstName: string;
  lastName: string;
  password: string;
  token: string;
}

export interface RegisterCompanyOwnerRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
  requiresPasswordChange?: boolean;
}

export interface ResendConfirmationEmailRequest {
  email: string;
}

export interface ConfirmEmailRequest {
  token: string;
}

export interface ForceChangePasswordRequest {
  newPassword: string;
  confirmNewPassword: string;
}
