'use client';

import { useQuery } from '@tanstack/react-query';

import { invitesControllerValidateToken } from 'lib/api';

export function useValidateInviteQuery(token: string) {
  return useQuery({
    queryKey: ['/invites/validate', token],
    queryFn: () => invitesControllerValidateToken({ token }),
    enabled: token.trim().length > 0,
    retry: false,
  });
}
