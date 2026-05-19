'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { inviteService } from './service';
import type { AcceptInvitationRequest, ValidateInviteResponse } from './types';

export function useValidateInviteQuery(token: string) {
  return useQuery<ValidateInviteResponse>({
    queryKey: ['invite', 'validate', token],
    queryFn: () => inviteService.validate({ token }),
    enabled: token.length > 0,
    retry: false,
  });
}

export function useAcceptInvitationMutation() {
  return useMutation({
    mutationFn: (payload: AcceptInvitationRequest) => inviteService.accept(payload),
  });
}
