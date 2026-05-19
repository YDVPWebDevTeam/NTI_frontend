export const teamEndpoints = {
  me: '/teams/me',
  byId: (teamId: string) => `/teams/${teamId}`,
  invitations: (teamId: string) => `/teams/${teamId}/invitations`,
  resendInvitation: (teamId: string, invitationId: string) =>
    `/teams/${teamId}/invitations/${invitationId}/resend`,
  revokeInvitation: (teamId: string, invitationId: string) =>
    `/teams/${teamId}/invitations/${invitationId}`,
};
