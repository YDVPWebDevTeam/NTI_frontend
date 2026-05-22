'use client';

import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import {
  adminSessionKeys,
  getStoredAdminPasswordChangeRequired,
  isAdminRole,
  type AdminRole,
  useAdminSessionQuery,
} from 'lib/api-client/admin/auth';
import { ROUTES } from 'lib/constants';

import { AdminShell, AdminShellSkeleton } from './admin-shell';
import { AdminErrorState } from './admin-state';
import { AdminRouteAccessKind } from './types';
import { getAdminRouteAccessDecision } from './utils';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionQuery = useAdminSessionQuery();
  const requiresPasswordChange = Boolean(
    queryClient.getQueryData<boolean>(adminSessionKeys.authFlow) === true ||
    getStoredAdminPasswordChangeRequired(),
  );

  const decision = getAdminRouteAccessDecision({
    pathname,
    session: sessionQuery.data,
    isAdmin: sessionQuery.isAdmin,
    isLoading: sessionQuery.isLoading,
    requiresPasswordChange,
  });
  const isAdminAuthRoute =
    pathname === ROUTES.ADMIN.LOGIN || pathname === ROUTES.ADMIN.FORCE_CHANGE_PASSWORD;

  useEffect(() => {
    if (
      decision.kind === AdminRouteAccessKind.REDIRECT &&
      decision.redirectTo &&
      decision.redirectTo !== pathname
    ) {
      router.replace(decision.redirectTo);
    }
  }, [decision.kind, decision.redirectTo, pathname, router]);

  if (
    decision.kind === AdminRouteAccessKind.LOADING ||
    decision.kind === AdminRouteAccessKind.REDIRECT
  ) {
    return <AdminShellSkeleton />;
  }

  if (sessionQuery.isError && !isAdminAuthRoute) {
    return (
      <AdminErrorState
        title={t`Admin session unavailable`}
        description={t`The admin session could not be verified. Retry once the connection is available.`}
        actionLabel={t`Retry`}
        onAction={() => void sessionQuery.refetch()}
      />
    );
  }

  if (decision.kind === AdminRouteAccessKind.AUTH) {
    return <>{children}</>;
  }

  const user = sessionQuery.data?.user;

  if (!user || !isAdminRole(user.role)) {
    return <AdminShellSkeleton />;
  }

  const adminUser: { email: string; role: AdminRole } = { email: user.email, role: user.role };

  return <AdminShell user={adminUser}>{children}</AdminShell>;
}
