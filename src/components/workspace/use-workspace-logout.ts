'use client';

import { t } from '@lingui/core/macro';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getGetMeQueryKey, useLogout } from 'lib/api';
import { ROUTES } from 'lib/constants';

export function useWorkspaceLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to log out right now.`);

      return;
    }

    // Logout succeeded: clear the cached session and leave the dashboard.
    // The redirect must run before invalidating queries — invalidateQueries
    // refetches active queries, which now return 401 and reject the promise.
    // If that rejection happened before the redirect, we'd never leave the page.
    await queryClient.cancelQueries({ queryKey: getGetMeQueryKey() });
    queryClient.removeQueries({ queryKey: getGetMeQueryKey(), exact: true });
    router.replace(ROUTES.ROOT);
    void queryClient.invalidateQueries();
  };

  return {
    handleLogout,
    isPending: logout.isPending,
  };
}
