import { t } from '@lingui/core/macro';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';

const BAD_REQUEST_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const CONFLICT_STATUS = 409;

export type InviteScreenState = {
  title: string;
  description: string;
};

function includesAny(message: string, fragments: string[]) {
  return fragments.some((fragment) => message.includes(fragment));
}

export function getInviteValidationState(error: unknown): InviteScreenState {
  if (isApiRequestError(error)) {
    const message = error.message.toLowerCase();

    if (error.status === 404) {
      return {
        title: t`Invite not found`,
        description: t`This invite link is invalid or no longer exists.`,
      };
    }

    if (
      error.status === BAD_REQUEST_STATUS &&
      includesAny(message, ['expired', 'revoked', 'accepted'])
    ) {
      return {
        title: t`Invite unavailable`,
        description: t`This invite has expired, was revoked, or has already been accepted.`,
      };
    }
  }

  return {
    title: t`Invite unavailable`,
    description: t`The invite could not be validated right now. Please try again later.`,
  };
}

export function getInviteActionErrorMessage(error: unknown, fallback: string) {
  if (!isApiRequestError(error)) {
    return fallback;
  }

  const message = error.message;

  if (error.status === FORBIDDEN_STATUS) {
    return t`The authenticated account email does not match the invited email.`;
  }

  if (error.status === 404) {
    return t`This invite is no longer available.`;
  }

  if (error.status === CONFLICT_STATUS) {
    return message;
  }

  if (error.status === BAD_REQUEST_STATUS && message) {
    return message;
  }

  return fallback;
}
