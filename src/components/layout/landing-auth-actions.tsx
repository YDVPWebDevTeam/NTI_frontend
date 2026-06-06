'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { useGetMe } from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { getDefaultRouteForRole } from 'lib/auth/access';

type LandingAuthAction = {
  className: string;
  href: string;
  label: string;
};

type LandingAuthActionsProps = {
  authenticatedClassName: string;
  className?: string;
  loadingFallback?: ReactNode;
  unauthenticatedActions: LandingAuthAction[];
};

function isUnauthorizedError(error: unknown) {
  return isApiRequestError(error) && error.status === 401;
}

export function LandingAuthActions({
  authenticatedClassName,
  className,
  loadingFallback = null,
  unauthenticatedActions,
}: LandingAuthActionsProps) {
  const meQuery = useGetMe({
    query: {
      retry: false,
    },
  });
  const error = meQuery.error as unknown;

  if (meQuery.isPending) {
    return (
      <div className={`${className} pointer-events-none invisible`} aria-hidden>
        {unauthenticatedActions.map((action) => (
          <span key={`${action.href}:${action.label}`} className={action.className}>
            {action.label}
          </span>
        ))}
      </div>
    );
  }

  if (meQuery.data) {
    return (
      <Link className={authenticatedClassName} href={getDefaultRouteForRole(meQuery.data.role)}>
        {t`Dashboard`}
      </Link>
    );
  }

  if (error && !isUnauthorizedError(error)) {
    return <>{loadingFallback}</>;
  }

  return (
    <div className={className}>
      {unauthenticatedActions.map((action) => (
        <Link
          key={`${action.href}:${action.label}`}
          className={action.className}
          href={action.href}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
