import { UserRole, type AuthenticatedUserDto } from 'lib/api';
import { ROUTES } from 'lib/constants';

export const STUDENT_ROLE = UserRole.STUDENT;
export const ORGANIZATION_ROLES = [UserRole.COMPANY_OWNER, UserRole.COMPANY_EMPLOYEE] as const;

export function isStudentRole(role?: AuthenticatedUserDto['role'] | null) {
  return role === STUDENT_ROLE;
}

export function isOrganizationRole(role?: AuthenticatedUserDto['role'] | null) {
  return Boolean(role && ORGANIZATION_ROLES.includes(role as (typeof ORGANIZATION_ROLES)[number]));
}

export function getDashboardRouteForRole(role?: AuthenticatedUserDto['role'] | null) {
  if (isStudentRole(role) || isOrganizationRole(role)) {
    return ROUTES.DASHBOARD;
  }

  return ROUTES.ROOT;
}
