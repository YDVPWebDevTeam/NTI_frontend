import type { AuthSessionResponse } from 'lib/api/admin/auth';
import type { AdminRole } from 'lib/api/admin/auth/types';

export type AdminNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export enum AdminRouteAccessKind {
  LOADING = 'loading',
  AUTH = 'auth',
  PROTECTED = 'protected',
  REDIRECT = 'redirect',
}

export type AdminRouteAccessDecision = {
  kind: AdminRouteAccessKind;
  redirectTo?: string;
};

export type AdminRouteAccessInput = {
  pathname: string;
  session: AuthSessionResponse | null | undefined;
  isAdmin: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;
};

export type AdminSessionUser = {
  email: string;
  role: AdminRole;
};

export enum StatusTone {
  NEUTRAL = 'neutral',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}
