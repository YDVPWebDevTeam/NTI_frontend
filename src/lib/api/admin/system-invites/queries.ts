'use client';

import { useMutation } from '@tanstack/react-query';

import { adminSystemInvitesService } from './service';
import type { CreateSystemInviteRequest } from './types';

export function useCreateSystemInvite() {
  return useMutation({
    mutationFn: (payload: CreateSystemInviteRequest) =>
      adminSystemInvitesService.createSystemInvite(payload),
  });
}
