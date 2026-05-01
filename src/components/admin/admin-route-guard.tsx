'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { getStoredAdminPasswordChangeRequired, useAdminSessionQuery } from 'lib/api/admin/auth';
import { isAdminRole, type AdminRole } from 'lib/api/admin/auth/types';
import { adminQueryKeys } from 'lib/api/admin/admin-query-keys';

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
    queryClient.getQueryData<boolean>(adminQueryKeys.authFlow()) === true ||
    getStoredAdminPasswordChangeRequired(),
  );

  const decision = getAdminRouteAccessDecision({
    pathname,
    session: sessionQuery.data,
    isAdmin: sessionQuery.isAdmin,
    isLoading: sessionQuery.isLoading,
    requiresPasswordChange,
  });

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

  if (sessionQuery.isError) {
    return (
      <AdminErrorState
        title="Admin session unavailable"
        description="The admin session could not be verified. Retry once the connection is available."
        actionLabel="Retry"
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
