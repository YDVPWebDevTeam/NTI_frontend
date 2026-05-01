export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export enum AdminFilterOption {
  ALL = 'ALL',
}

export enum UserAccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum OrganizationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export type AdminStatus = UserAccountStatus | OrganizationStatus | InviteStatus;

export type UserStatusFilter = AdminFilterOption | UserAccountStatus;
export type OrganizationStatusFilter = AdminFilterOption | OrganizationStatus;

export const userStatusFilters = [
  AdminFilterOption.ALL,
  UserAccountStatus.ACTIVE,
  UserAccountStatus.SUSPENDED,
] as const satisfies readonly UserStatusFilter[];

export const organizationStatusFilters = [
  AdminFilterOption.ALL,
  OrganizationStatus.PENDING,
  OrganizationStatus.ACTIVE,
  OrganizationStatus.REJECTED,
] as const satisfies readonly OrganizationStatusFilter[];
