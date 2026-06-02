'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useGetMe, type UserRole } from 'lib/api';
import { isApiRequestError, isAuthErrorStatus } from 'lib/api-client/openapi-runtime/client';
import { getPostAuthRedirect } from 'lib/auth/public-auth-flow';
import { ROUTES } from 'lib/constants';

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

    if (isAuthErrorStatus(meQuery.error.status)) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [meQuery.error, router]);

  useEffect(() => {
    if (!meQuery.data) {
      return;
    }

    if (meQuery.data.status !== 'ACTIVE') {
      router.replace(getPostAuthRedirect(meQuery.data));

      return;
    }

    if (!allowedRoles) {
      return;
    }

    if (!allowedRoles.includes(meQuery.data.role)) {
      router.replace(getPostAuthRedirect(meQuery.data));
    }
  }, [allowedRoles, meQuery.data, router]);

  const isAllowed = Boolean(
    meQuery.data &&
    meQuery.data.status === 'ACTIVE' &&
    (!allowedRoles || allowedRoles.includes(meQuery.data.role)),
  );

  return {
    ...meQuery,
    me: meQuery.data ?? null,
    isAllowed,
  };
}
