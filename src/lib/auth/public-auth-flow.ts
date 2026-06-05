import { t } from '@lingui/core/macro';

import { UserRole, UserStatus, type AuthenticatedUserDto } from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { ROUTES } from 'lib/constants';

import { getDefaultRouteForRole } from './access';

const FORBIDDEN_STATUS_CODE = 403;

export type AuthFlowErrorAction = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
};

export function getPostAuthRedirect(user?: AuthenticatedUserDto | null): string {
  if (!user) {
    return ROUTES.AUTH.LOGIN;
  }

  if (user.status === UserStatus.SUSPENDED) {
    return ROUTES.AUTH.LOGIN;
  }

  if (user.status === UserStatus.PENDING) {
    if (user.role === UserRole.COMPANY_OWNER) {
      return ROUTES.AUTH.REGISTER_COMPANY_ORGANIZATION;
    }

    return ROUTES.AUTH.LOGIN;
  }

  return getDefaultRouteForRole(user.role);
}

export function mapAuthError(error: unknown): AuthFlowErrorAction {
  const message = error instanceof Error ? error.message : '';

  if (isApiRequestError(error) && error.status === 401) {
    if (message.includes('Email confirmation is required')) {
      return {
        title: t`Email confirmation required`,
        description: t`Please confirm your email address before signing in.`,
        href: ROUTES.AUTH.LOGIN,
        actionLabel: t`Back to login`,
      };
    }

    if (message.includes('User account is suspended') || message.includes('suspended')) {
      return {
        title: t`Account suspended`,
        description: t`This account cannot sign in right now. Contact support if you think this is a mistake.`,
        href: ROUTES.AUTH.LOGIN,
        actionLabel: t`Back to login`,
      };
    }

    return {
      title: t`Session expired`,
      description: t`Please sign in again to continue.`,
      href: ROUTES.AUTH.LOGIN,
      actionLabel: t`Sign in`,
    };
  }

  if (isApiRequestError(error) && error.status === FORBIDDEN_STATUS_CODE) {
    return {
      title: t`Access forbidden`,
      description: t`Your account does not have access to this page.`,
      href: ROUTES.ROOT,
      actionLabel: t`Go home`,
    };
  }

  if (message.includes('Invalid or expired password reset token')) {
    return {
      title: t`Reset link expired`,
      description: t`Request a new password reset link and try again.`,
      href: ROUTES.AUTH.FORGOT_PASSWORD,
      actionLabel: t`Request new link`,
    };
  }

  if (message.includes('Invalid or expired')) {
    return {
      title: t`Link expired`,
      description: t`The link is invalid or expired. Request a new link and try again.`,
      href: ROUTES.AUTH.FORGOT_PASSWORD,
      actionLabel: t`Request new link`,
    };
  }

  return {
    title: t`Something went wrong`,
    description: message || t`Please try again.`,
  };
}
