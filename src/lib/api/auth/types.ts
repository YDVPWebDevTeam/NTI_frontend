export type AuthRole = 'STUDENT' | 'COMPANY_OWNER' | 'ADMIN' | 'SUPER_ADMIN' | (string & {});

export type AuthStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | (string & {});

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
  name: string;
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
