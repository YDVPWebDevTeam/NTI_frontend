import { api } from 'lib/api/base-client';

import { teamEndpoints } from './endpoints';
import type {
  CreateTeamInvitationsRequest,
  CreateTeamInvitationsResponse,
  ListTeamInvitationsResponse,
  TeamDetail,
  TeamInvitationFilters,
  ResendTeamInvitationResponse,
  RevokeTeamInvitationResponse,
} from './types';

export const teamService = {
  getMyTeam() {
    return api.get<TeamDetail>(teamEndpoints.me);
  },

  listInvitations(teamId: string, params: TeamInvitationFilters = {}) {
    return api.get<ListTeamInvitationsResponse>(teamEndpoints.invitations(teamId), {
      params: params as Record<string, unknown>,
    });
  },

  createInvitations(teamId: string, payload: CreateTeamInvitationsRequest) {
    return api.post<CreateTeamInvitationsResponse, CreateTeamInvitationsRequest>(
      teamEndpoints.invitations(teamId),
      payload,
    );
  },

  resendInvitation(teamId: string, invitationId: string) {
    return api.post<ResendTeamInvitationResponse>(
      teamEndpoints.resendInvitation(teamId, invitationId),
    );
  },

  revokeInvitation(teamId: string, invitationId: string) {
    return api.delete<RevokeTeamInvitationResponse>(
      teamEndpoints.revokeInvitation(teamId, invitationId),
    );
  },
};
