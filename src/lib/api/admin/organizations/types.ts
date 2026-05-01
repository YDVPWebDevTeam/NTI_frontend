import type { UserRole } from '../auth/types';
import { type InviteStatus, OrganizationStatus } from '../types';

export const organizationReviewStatuses = [
  OrganizationStatus.ACTIVE,
  OrganizationStatus.REJECTED,
] as const;
export type OrganizationReviewStatus = (typeof organizationReviewStatuses)[number];

export interface UpdateOrganizationStatusRequest {
  status: OrganizationReviewStatus;
  rejectionReason?: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  status: OrganizationStatus;
  website: string | null;
  sector: string | null;
  description: string | null;
  logoUrl: string | null;
  ico: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationInvite {
  id: string;
  email: string;
  roleToAssign: UserRole;
  status: InviteStatus;
  organizationId: string;
  revokedById: unknown;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}
