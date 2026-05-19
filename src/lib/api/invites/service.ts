import { api } from 'lib/api/base-client';

import { inviteEndpoints } from './endpoints';
import type {
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  ValidateInviteRequest,
  ValidateInviteResponse,
} from './types';

export const inviteService = {
  validate(payload: ValidateInviteRequest) {
    return api.post<ValidateInviteResponse, ValidateInviteRequest>(
      inviteEndpoints.validate,
      payload,
    );
  },

  accept(payload: AcceptInvitationRequest) {
    return api.post<AcceptInvitationResponse, AcceptInvitationRequest>(
      inviteEndpoints.accept,
      payload,
    );
  },
};
