'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';

import {
  UserRole,
  adminForceChangePassword,
  adminLogin,
  getMe,
  logout,
  type AdminForceChangePasswordMutationBody,
  type AdminForceChangePasswordMutationResult,
  type AdminLoginMutationBody,
  type AdminLoginMutationResult,
  type AuthenticatedUserDto,
} from 'lib/api';
import {
  ApiRequestError,
  isApiRequestError,
  isAuthErrorStatus,
} from 'lib/api-client/openapi-runtime/client';

const ADMIN_PASSWORD_CHANGE_STORAGE_KEY = 'nti.admin.requires-password-change';

export const adminSessionKeys = {
  authFlow: ['admin', 'auth', 'flow'] as const,
  authSession: ['admin', 'auth', 'session'] as const,
};

export type AdminRole = typeof UserRole.ADMIN | typeof UserRole.SUPER_ADMIN;
export type AuthSessionResponse = {
  user: AuthenticatedUserDto;
};

function getAdminAuthStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function isAdminRole(role?: string | null): role is AdminRole {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export function getStoredAdminPasswordChangeRequired() {
  return getAdminAuthStorage()?.getItem(ADMIN_PASSWORD_CHANGE_STORAGE_KEY) === 'true';
}

export function setStoredAdminPasswordChangeRequired(required: boolean) {
  const storage = getAdminAuthStorage();

  if (!storage) {
    return;
  }

  if (required) {
    storage.setItem(ADMIN_PASSWORD_CHANGE_STORAGE_KEY, 'true');

    return;
  }

  storage.removeItem(ADMIN_PASSWORD_CHANGE_STORAGE_KEY);
}

export function clearAdminApiCache(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => {
      const firstKey = query.queryKey[0];

      return (
        firstKey === adminSessionKeys.authSession[0] ||
        (typeof firstKey === 'string' &&
          (firstKey === '/auth/me' || firstKey.startsWith('/admin/')))
      );
    },
  });
}

export function loginAdmin(payload: AdminLoginMutationBody): Promise<AdminLoginMutationResult> {
  return adminLogin(payload);
}

export function changeAdminPassword(
  payload: AdminForceChangePasswordMutationBody,
): Promise<AdminForceChangePasswordMutationResult> {
  return adminForceChangePassword(payload);
}

export function logoutAdmin() {
  return logout();
}

export function useAdminSessionQuery() {
  const query = useQuery({
    queryKey: adminSessionKeys.authSession,
    queryFn: async (): Promise<AuthSessionResponse | null> => {
      try {
        const user = await getMe();

        return { user };
      } catch (error) {
        if (isApiRequestError(error) && isAuthErrorStatus(error.status)) {
          setStoredAdminPasswordChangeRequired(false);

          return null;
        }

        throw error;
      }
    },
    retry: false,
  });

  return {
    ...query,
    isAdmin: isAdminRole(query.data?.user.role),
  };
}

export { ApiRequestError, isApiRequestError, isAuthErrorStatus };
