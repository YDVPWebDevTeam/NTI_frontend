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
      await queryClient.cancelQueries({ queryKey: getGetMeQueryKey() });
      queryClient.removeQueries({ queryKey: getGetMeQueryKey(), exact: true });
      await queryClient.invalidateQueries();
      router.replace(ROUTES.ROOT);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to log out right now.`);
    }
  };

  return {
    handleLogout,
    isPending: logout.isPending,
  };
}
