'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { teamService } from './service';
import type { CreateTeamInvitationsRequest, TeamInvitationFilters } from './types';

export function useMyTeamQuery(enabled = true) {
  return useQuery({
    queryKey: ['teams', 'me'],
    queryFn: () => teamService.getMyTeam(),
    enabled,
    retry: false,
  });
}

export function useTeamInvitationsQuery(
  teamId: string,
  params: TeamInvitationFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['teams', teamId, 'invitations', params],
    queryFn: () => teamService.listInvitations(teamId, params),
    enabled: Boolean(teamId) && enabled,
  });
}

export function useCreateTeamInvitationsMutation() {
  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: CreateTeamInvitationsRequest }) =>
      teamService.createInvitations(teamId, payload),
  });
}

export function useResendTeamInvitationMutation() {
  return useMutation({
    mutationFn: ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
      teamService.resendInvitation(teamId, invitationId),
  });
}

export function useRevokeTeamInvitationMutation() {
  return useMutation({
    mutationFn: ({ teamId, invitationId }: { teamId: string; invitationId: string }) =>
      teamService.revokeInvitation(teamId, invitationId),
  });
}
