import {
  AdminOrganizationRowDtoStatus,
  PublicCallDtoStatus,
  SystemInviteResponseDtoStatus,
  UserStatus,
} from 'lib/api';

export const AdminFilterOption = {
  ALL: 'ALL',
} as const;

export type AdminFilterOption = (typeof AdminFilterOption)[keyof typeof AdminFilterOption];

export const UserAccountStatus = UserStatus;
export type UserAccountStatus = (typeof UserAccountStatus)[keyof typeof UserAccountStatus];

export const OrganizationStatus = AdminOrganizationRowDtoStatus;
export type OrganizationStatus = (typeof OrganizationStatus)[keyof typeof OrganizationStatus];

export const InviteStatus = SystemInviteResponseDtoStatus;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export const CallStatus = PublicCallDtoStatus;
export type CallStatus = (typeof CallStatus)[keyof typeof CallStatus];

export type AdminStatus = UserAccountStatus | OrganizationStatus | InviteStatus | CallStatus;

export type UserStatusFilter = AdminFilterOption | UserAccountStatus;
export type OrganizationStatusFilter = AdminFilterOption | OrganizationStatus;
export type CallStatusFilter = AdminFilterOption | CallStatus;

export const userStatusFilters = [
  AdminFilterOption.ALL,
  UserAccountStatus.ACTIVE,
  UserAccountStatus.PENDING,
  UserAccountStatus.SUSPENDED,
] as const satisfies readonly UserStatusFilter[];

export const organizationStatusFilters = [
  AdminFilterOption.ALL,
  OrganizationStatus.PENDING,
  OrganizationStatus.ACTIVE,
  OrganizationStatus.REJECTED,
  OrganizationStatus.SUSPENDED,
] as const satisfies readonly OrganizationStatusFilter[];

export const callStatusFilters = [
  AdminFilterOption.ALL,
  CallStatus.DRAFT,
  CallStatus.OPEN,
  CallStatus.CLOSED,
  CallStatus.ARCHIVED,
] as const satisfies readonly CallStatusFilter[];
