'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useGetMe, type UserRole } from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { ROUTES } from 'lib/constants';
import { getDashboardRouteForRole } from './access';

export function useAuthenticatedUser(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const meQuery = useGetMe({
    query: {
      retry: false,
    },
  });

  useEffect(() => {
    if (!isApiRequestError(meQuery.error)) {
      return;
    }

    if (meQuery.error.status === 401) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [meQuery.error, router]);

  useEffect(() => {
    if (!meQuery.data || !allowedRoles) {
      return;
    }

    if (!allowedRoles.includes(meQuery.data.role)) {
      router.replace(getDashboardRouteForRole(meQuery.data.role));
    }
  }, [allowedRoles, meQuery.data, router]);

  const isAllowed = Boolean(
    meQuery.data && (!allowedRoles || allowedRoles.includes(meQuery.data.role)),
  );

  return {
    ...meQuery,
    me: meQuery.data ?? null,
    isAllowed,
  };
}
