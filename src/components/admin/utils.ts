import { t } from '@lingui/core/macro';

import { ROUTES } from 'lib/constants';
import { DATE_FORMATS, formatDate } from 'lib/date';
import { formatEnumLabel } from 'lib/utils';
import {
  type AdminStatus,
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
  [UserAccountStatus.SUSPENDED]: StatusTone.WARNING,
  [OrganizationStatus.PENDING]: StatusTone.WARNING,
  [OrganizationStatus.REJECTED]: StatusTone.DANGER,
  [InviteStatus.REVOKED]: StatusTone.DANGER,
  [InviteStatus.EXPIRED]: StatusTone.DANGER,
};

export function getStatusTone(status: AdminStatus): StatusTone {
  return STATUS_TONE_MAP[status] ?? StatusTone.NEUTRAL;
}

export function getAdminPageTitle(pathname: string) {
  if (pathname === ROUTES.ADMIN.ROOT) {
    return t`Overview`;
  }

  if (pathname === ROUTES.ADMIN.USERS) {
    return t`Users`;
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

  return t`Admin`;
}

export function formatStatusLabel(status: AdminStatus) {
  return formatEnumLabel(status);
}
