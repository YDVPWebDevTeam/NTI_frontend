import { t } from '@lingui/core/macro';

import { ROUTES } from 'lib/constants';
import { DATE_FORMATS, formatDate } from 'lib/date';
import {
  type AdminStatus,
  CallStatus,
  InviteStatus,
  OrganizationStatus,
  UserAccountStatus,
} from 'lib/api-client/admin/types';

import {
  AdminRouteAccessKind,
  StatusTone,
  type AdminNavItem,
  type AdminRouteAccessDecision,
  type AdminRouteAccessInput,
} from './types';

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: ROUTES.ADMIN.ROOT,
    label: 'Overview',
    exact: true,
  },
  {
    href: ROUTES.ADMIN.MODERATION,
    label: 'Moderation',
  },
  {
    href: ROUTES.ADMIN.CALLS,
    label: 'Calls',
  },
  {
    href: ROUTES.ADMIN.PROGRAM_B_PROJECTS,
    label: 'Program B',
  },
  {
    href: ROUTES.ADMIN.REPORTS,
    label: 'Reports',
  },
  {
    href: ROUTES.ADMIN.USERS,
    label: 'Users',
  },
  {
    href: ROUTES.ADMIN.ACADEMIC_STRUCTURE,
    label: 'Academic Structure',
  },
  {
    href: ROUTES.ADMIN.ORGANIZATIONS,
    label: 'Organizations',
  },
  {
    href: ROUTES.ADMIN.INVITES,
    label: 'Invites',
  },
];

export function getAdminNavLabel(href: string) {
  if (href === ROUTES.ADMIN.ROOT) {
    return 'Overview';
  }

  if (href === ROUTES.ADMIN.MODERATION) {
    return 'Moderation';
  }

  if (href === ROUTES.ADMIN.CALLS) {
    return 'Calls';
  }

  if (href === ROUTES.ADMIN.PROGRAM_B_PROJECTS) {
    return 'Program B';
  }

  if (href === ROUTES.ADMIN.REPORTS) {
    return 'Reports';
  }

  if (href === ROUTES.ADMIN.USERS) {
    return 'Users';
  }

  if (href === ROUTES.ADMIN.ACADEMIC_STRUCTURE) {
    return 'Academic Structure';
  }

  if (href === ROUTES.ADMIN.ORGANIZATIONS) {
    return 'Organizations';
  }

  if (href === ROUTES.ADMIN.INVITES) {
    return 'Invites';
  }

  return href;
}

export function getAdminRouteAccessDecision({
  pathname,
  session,
  isAdmin,
  isLoading,
  requiresPasswordChange,
}: AdminRouteAccessInput): AdminRouteAccessDecision {
  const isLoginRoute = pathname === ROUTES.ADMIN.LOGIN;
  const isForceChangeRoute = pathname === ROUTES.ADMIN.FORCE_CHANGE_PASSWORD;

  if (isLoading) {
    return { kind: AdminRouteAccessKind.LOADING };
  }

  if (isForceChangeRoute) {
    if (requiresPasswordChange) {
      return { kind: AdminRouteAccessKind.AUTH };
    }

    if (isAdmin) {
      return { kind: AdminRouteAccessKind.REDIRECT, redirectTo: ROUTES.ADMIN.ROOT };
    }

    if (session && !isAdmin) {
      return { kind: AdminRouteAccessKind.REDIRECT, redirectTo: ROUTES.ROOT };
    }

    return { kind: AdminRouteAccessKind.REDIRECT, redirectTo: ROUTES.ADMIN.LOGIN };
  }

  if (isLoginRoute) {
    if (requiresPasswordChange) {
      return {
        kind: AdminRouteAccessKind.REDIRECT,
        redirectTo: ROUTES.ADMIN.FORCE_CHANGE_PASSWORD,
      };
    }

    return { kind: AdminRouteAccessKind.AUTH };
  }

  if (requiresPasswordChange) {
    return { kind: AdminRouteAccessKind.REDIRECT, redirectTo: ROUTES.ADMIN.FORCE_CHANGE_PASSWORD };
  }

  if (!session) {
    return { kind: AdminRouteAccessKind.REDIRECT, redirectTo: ROUTES.ADMIN.LOGIN };
  }

  if (!isAdmin) {
    return { kind: AdminRouteAccessKind.REDIRECT, redirectTo: ROUTES.ROOT };
  }

  return { kind: AdminRouteAccessKind.PROTECTED };
}

export function formatAdminDateTime(value?: string | null) {
  if (!value) {
    return t`Not available`;
  }

  return formatDate(value, DATE_FORMATS.ISO_DATE_TIME);
}

type AdminStatusValue = `${AdminStatus}`;

const STATUS_TONE_MAP: Partial<Record<AdminStatusValue, StatusTone>> = {
  [UserAccountStatus.ACTIVE]: StatusTone.SUCCESS,
  [InviteStatus.ACCEPTED]: StatusTone.SUCCESS,
  [CallStatus.OPEN]: StatusTone.SUCCESS,

  [UserAccountStatus.SUSPENDED]: StatusTone.WARNING,
  [OrganizationStatus.PENDING]: StatusTone.WARNING,
  [CallStatus.DRAFT]: StatusTone.NEUTRAL,

  [OrganizationStatus.REJECTED]: StatusTone.DANGER,
  [InviteStatus.REVOKED]: StatusTone.DANGER,
  [InviteStatus.EXPIRED]: StatusTone.DANGER,
  [CallStatus.CLOSED]: StatusTone.WARNING,
  [CallStatus.ARCHIVED]: StatusTone.DANGER,
};

export function getStatusTone(status: AdminStatus): StatusTone {
  return STATUS_TONE_MAP[status] ?? StatusTone.NEUTRAL;
}

export function getAdminPageTitle(pathname: string) {
  if (pathname === ROUTES.ADMIN.ROOT) {
    return t`Overview`;
  }

  if (pathname === ROUTES.ADMIN.MODERATION) {
    return t`Moderation`;
  }

  if (pathname === ROUTES.ADMIN.CALLS) {
    return t`Calls`;
  }

  if (pathname === ROUTES.ADMIN.USERS) {
    return t`Users`;
  }

  if (pathname === ROUTES.ADMIN.REPORTS) {
    return t`Reports`;
  }

  if (pathname === ROUTES.ADMIN.ACADEMIC_STRUCTURE) {
    return t`Academic Structure`;
  }

  if (pathname === ROUTES.ADMIN.ORGANIZATIONS) {
    return t`Organizations`;
  }

  if (pathname.startsWith(`${ROUTES.ADMIN.ORGANIZATIONS}/`)) {
    return t`Organization Invites`;
  }

  if (pathname === ROUTES.ADMIN.INVITES) {
    return t`System Invites`;
  }

  if (pathname.startsWith(ROUTES.ADMIN.CALLS)) {
    return t`Calls`;
  }

  if (pathname.startsWith(ROUTES.ADMIN.PROGRAM_B_PROJECTS)) {
    return t`Program B`;
  }

  return t`Admin`;
}

export function formatStatusLabel(status: AdminStatus) {
  switch (status) {
    case UserAccountStatus.ACTIVE:
      return t`Active`;

    case UserAccountStatus.PENDING:
      return t`Pending`;

    case UserAccountStatus.SUSPENDED:
      return t`Suspended`;

    case OrganizationStatus.ACTIVE:
      return t`Active`;

    case OrganizationStatus.PENDING:
      return t`Pending`;

    case OrganizationStatus.REJECTED:
      return t`Rejected`;

    case OrganizationStatus.SUSPENDED:
      return t`Suspended`;

    case InviteStatus.PENDING:
      return t`Pending`;

    case InviteStatus.ACCEPTED:
      return t`Accepted`;

    case InviteStatus.REVOKED:
      return t`Revoked`;

    case InviteStatus.EXPIRED:
      return t`Expired`;

    case CallStatus.DRAFT:
      return t`Draft`;

    case CallStatus.OPEN:
      return t`Open`;

    case CallStatus.CLOSED:
      return t`Closed`;

    case CallStatus.ARCHIVED:
      return t`Archived`;

    default:
      return status;
  }
}
