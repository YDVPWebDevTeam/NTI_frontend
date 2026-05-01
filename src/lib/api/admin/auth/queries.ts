'use client';

import { useQuery } from '@tanstack/react-query';

import { adminQueryKeys } from '../admin-query-keys';
import { isApiRequestError, isAuthErrorStatus } from '../../base-client';
import { setStoredAdminPasswordChangeRequired } from './state';
import { isAdminRole } from './types';
import { authService } from './service';

export function useAuthSessionQuery() {
  return useQuery({
    queryKey: adminQueryKeys.authSession(),
    queryFn: async () => {
      try {
        return await authService.refresh();
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
}

export function useAdminSessionQuery() {
  const query = useAuthSessionQuery();
  const role = query.data?.user?.role;

  return {
    ...query,
    isAdmin: isAdminRole(role),
  };
}
