export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  COMPANY_OWNER = 'COMPANY_OWNER',
  COMPANY_EMPLOYEE = 'COMPANY_EMPLOYEE',
  MENTOR = 'MENTOR',
  EVALUATOR = 'EVALUATOR',
  CONTENT_EDITOR = 'CONTENT_EDITOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  REQUIRES_PASSWORD_CHANGE = 'requires_password_change',
  ANONYMOUS = 'anonymous',
}

export const userRoles = [
  UserRole.STUDENT,
  UserRole.ADMIN,
  UserRole.COMPANY_OWNER,
  UserRole.COMPANY_EMPLOYEE,
  UserRole.MENTOR,
  UserRole.EVALUATOR,
  UserRole.CONTENT_EDITOR,
  UserRole.SUPER_ADMIN,
] as const;

export const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN] as const;
export type AdminRole = (typeof adminRoles)[number];

export function isAdminRole(role?: UserRole | null): role is AdminRole {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  refreshTokenId?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  user?: AuthUser;
  requiresPasswordChange: boolean;
}

export interface ForceChangePasswordRequest {
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
}
