'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useGetMe, UserStatus, type UserRole } from 'lib/api';
import { isApiRequestError, isAuthErrorStatus } from 'lib/api-client/openapi-runtime/client';
import { getPostAuthRedirect } from 'lib/auth/public-auth-flow';
import { ROUTES } from 'lib/constants';

type UseAuthenticatedUserOptions = {
  allowPending?: boolean;
  preservePathOnAuthRedirect?: boolean;
};

function buildLoginRedirectPath(options?: UseAuthenticatedUserOptions, pathname?: string | null) {
  if (!options?.preservePathOnAuthRedirect || !pathname) {
    return ROUTES.AUTH.LOGIN;
  }

  const searchParams = new URLSearchParams({
    redirectTo: pathname,
  });

  return `${ROUTES.AUTH.LOGIN}?${searchParams.toString()}`;
}

export function useAuthenticatedUser(
  allowedRoles?: UserRole[],
  options?: UseAuthenticatedUserOptions,
) {
  const router = useRouter();
  const pathname = usePathname();

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
      router.replace(buildLoginRedirectPath(options, pathname));
    }
  }, [meQuery.error, options, pathname, router]);

  useEffect(() => {
    if (!meQuery.data) {
      return;
    }

    if (meQuery.data.status !== UserStatus.ACTIVE) {
      if (options?.allowPending && meQuery.data.status === UserStatus.PENDING) {
        return;
      }

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
    (meQuery.data.status === UserStatus.ACTIVE ||
      (options?.allowPending && meQuery.data.status === UserStatus.PENDING)) &&
    (!allowedRoles || allowedRoles.includes(meQuery.data.role)),
  );

  return {
    ...meQuery,
    me: meQuery.data ?? null,
    isAllowed,
  };
}
