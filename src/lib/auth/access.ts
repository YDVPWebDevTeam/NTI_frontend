import { UserRole, type AuthenticatedUserDto } from 'lib/api';
import { ROUTES } from 'lib/constants';

export type WorkspaceFamily = 'student' | 'company' | 'mentor' | 'review' | 'admin';

type Role = AuthenticatedUserDto['role'];

type WorkspaceAccessPolicy = {
  family: WorkspaceFamily;
  rootRoute: string;
  allowedRoutePrefixes: readonly string[];
  roles: readonly UserRole[];
};

const STUDENT_ROLES = [UserRole.STUDENT] as const;
const COMPANY_ROLES = [UserRole.COMPANY_OWNER, UserRole.COMPANY_EMPLOYEE] as const;
const MENTOR_ROLES = [UserRole.MENTOR] as const;
const REVIEW_ROLES = [UserRole.EVALUATOR] as const;
const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN] as const;

const WORKSPACE_POLICIES: readonly WorkspaceAccessPolicy[] = [
  {
    family: 'student',
    rootRoute: ROUTES.STUDENT.ROOT,
    allowedRoutePrefixes: ['/student', ROUTES.ONBOARDING_PROFILE, ROUTES.ACCOUNT],
    roles: STUDENT_ROLES,
  },
  {
    family: 'company',
    rootRoute: ROUTES.COMPANY.ROOT,
    allowedRoutePrefixes: ['/company', ROUTES.ACCOUNT],
    roles: COMPANY_ROLES,
  },
  {
    family: 'mentor',
    rootRoute: ROUTES.MENTOR.ROOT,
    allowedRoutePrefixes: ['/mentor', ROUTES.ACCOUNT],
    roles: MENTOR_ROLES,
  },
  {
    family: 'review',
    rootRoute: ROUTES.REVIEW.ROOT,
    allowedRoutePrefixes: ['/review', ROUTES.ACCOUNT],
    roles: REVIEW_ROLES,
  },
  {
    family: 'admin',
    rootRoute: ROUTES.ADMIN.ROOT,
    allowedRoutePrefixes: ['/admin'],
    roles: ADMIN_ROLES,
  },
] as const;

function hasRole(role: Role | undefined | null, roles: readonly UserRole[]) {
  return Boolean(role && roles.includes(role));
}

export function getWorkspaceAccessPolicy(role?: Role | null) {
  return WORKSPACE_POLICIES.find((policy) => hasRole(role, policy.roles)) ?? null;
}

export function getWorkspaceFamily(role?: Role | null) {
  return getWorkspaceAccessPolicy(role)?.family ?? null;
}

export function getDefaultRouteForRole(role?: Role | null) {
  return getWorkspaceAccessPolicy(role)?.rootRoute ?? ROUTES.ROOT;
}

export function getAllowedRoutePrefixesForRole(role?: Role | null) {
  return getWorkspaceAccessPolicy(role)?.allowedRoutePrefixes ?? [];
}

export function isStudentRole(role?: Role | null) {
  return hasRole(role, STUDENT_ROLES);
}

export function isOrganizationRole(role?: Role | null) {
  return hasRole(role, COMPANY_ROLES);
}

export function isMentorRole(role?: Role | null) {
  return hasRole(role, MENTOR_ROLES);
}

export function isReviewRole(role?: Role | null) {
  return hasRole(role, REVIEW_ROLES);
}

export function isWorkspaceRouteAllowed(role: Role | null | undefined, pathname: string) {
  const allowedPrefixes = getAllowedRoutePrefixesForRole(role);

  if (!allowedPrefixes.length) {
    return pathname === ROUTES.ROOT;
  }

  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
