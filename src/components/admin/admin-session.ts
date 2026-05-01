'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { adminQueryKeys } from 'lib/api/admin/admin-query-keys';
import { setStoredAdminPasswordChangeRequired } from 'lib/api/admin/auth';
import { isApiRequestError, isAuthErrorStatus } from 'lib/api/base-client';
import { ROUTES } from 'lib/constants';

export function useHandleAdminSessionFailure() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async (error: unknown, fallbackMessage: string) => {
    if (isApiRequestError(error) && isAuthErrorStatus(error.status)) {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.all });
      queryClient.removeQueries({ queryKey: adminQueryKeys.all });
      setStoredAdminPasswordChangeRequired(false);
      toast.error(t`Your admin session has expired.`);
      router.replace(ROUTES.ADMIN.LOGIN);

      return;
    }

    toast.error(error instanceof Error ? error.message : fallbackMessage);
  };
}
