export interface ValidateInviteRequest {
  token: string;
}

export interface ValidateInviteResponse {
  email: string;
  teamName: string;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface AcceptInvitationResponse {
  userId: string;
  teamId: string;
}
