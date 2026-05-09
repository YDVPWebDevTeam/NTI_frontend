import { api } from 'lib/api/base-client';

import { organizationEndpoints } from './endpoints';
import type { CreateOrganizationRequest, OrganizationResponse } from './types';

export const organizationService = {
  createOrganization(payload: CreateOrganizationRequest) {
    return api.post<OrganizationResponse, CreateOrganizationRequest>(
      organizationEndpoints.create,
      payload,
    );
  },

  getMyOrganization() {
    return api.get<OrganizationResponse>(organizationEndpoints.me);
  },
};
