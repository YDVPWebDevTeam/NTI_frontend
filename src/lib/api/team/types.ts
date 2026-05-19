export interface TeamMemberSummary {
  userId: string;
  role?: string;
}

export interface TeamDetail {
  id: string;
  name: string;
  leaderId: string;
  createdAt: string;
  updatedAt: string;
  lockedAt?: string | null;
  archivedAt?: string | null;
  members?: TeamMemberSummary[];
}

export type TeamInvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED' | (string & {});

export interface TeamInvitation {
  id: string;
  email: string;
  status: TeamInvitationStatus;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
}

export interface TeamInvitationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListTeamInvitationsResponse {
  data: TeamInvitation[];
  meta: TeamInvitationsMeta;
}

export interface TeamInvitationFilters {
  status?: TeamInvitationStatus;
  q?: string;
  page?: number;
  limit?: number;
  sort?: 'createdAt';
  order?: 'asc' | 'desc';
}

export interface CreateTeamInvitationsRequest {
  emails: string[];
}

export interface CreateTeamInvitationsResponse {
  createdCount: number;
  invitations: Array<{
    id: string;
    email: string;
  }>;
}

export interface ResendTeamInvitationResponse {
  id: string;
  email: string;
  status: TeamInvitationStatus;
  expiresAt: string;
}

export interface RevokeTeamInvitationResponse {
  id: string;
  email: string;
  status: TeamInvitationStatus;
  revokedAt?: string;
}
