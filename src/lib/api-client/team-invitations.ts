'use client';

import { useMutation } from '@tanstack/react-query';

import {
  invitationControllerCreateInvites,
  invitationControllerResendInvitation,
  invitationControllerRevokeInvitation,
  useInvitationControllerListInvites,
  useTeamControllerFindCurrentForUser,
  type GetTeamInvitesResponseDto,
  type InvitationControllerListInvitesParams,
} from 'lib/api';

export type TeamInvitation = GetTeamInvitesResponseDto['data'][number];
export type TeamInvitationStatus = TeamInvitation['status'];

export function useMyTeamQuery(enabled = true) {
  return useTeamControllerFindCurrentForUser({
    query: {
      enabled,
      retry: false,
    },
  });
}

export function useTeamInvitationsQuery(
  teamId: string,
  params?: InvitationControllerListInvitesParams,
  enabled = true,
) {
  return useInvitationControllerListInvites(teamId, params, {
    query: {
      enabled: enabled && teamId.trim().length > 0,
    },
  });
}

export function useCreateTeamInvitationsMutation() {
  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: { emails: string[] } }) =>
      invitationControllerCreateInvites(teamId, payload),
  });
}

export function useResendTeamInvitationMutation() {
  return useMutation({
    mutationFn: ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
      invitationControllerResendInvitation(teamId, invitationId),
  });
}

export function useRevokeTeamInvitationMutation() {
  return useMutation({
    mutationFn: ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
      invitationControllerRevokeInvitation(teamId, invitationId),
  });
}
