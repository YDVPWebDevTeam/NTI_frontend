'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useGetMe, type UserRole } from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { ROUTES } from 'lib/constants';
import { getDefaultRouteForRole } from 'lib/auth/access';

type UseAuthenticatedUserOptions = {
  preservePathOnAuthRedirect?: boolean;
};

export function useAuthenticatedUser(
  allowedRoles?: UserRole[],
  options?: UseAuthenticatedUserOptions,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      if (options?.preservePathOnAuthRedirect && pathname) {
        const nextPath = searchParams?.toString()
          ? `${pathname}?${searchParams.toString()}`
          : pathname;
        const params = new URLSearchParams({ next: nextPath });

        router.replace(`${ROUTES.AUTH.LOGIN}?${params.toString()}`);

        return;
      }

      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [meQuery.error, options?.preservePathOnAuthRedirect, pathname, router, searchParams]);

  useEffect(() => {
    if (!meQuery.data || !allowedRoles) {
      return;
    }

    if (!allowedRoles.includes(meQuery.data.role)) {
      router.replace(getDefaultRouteForRole(meQuery.data.role));
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
