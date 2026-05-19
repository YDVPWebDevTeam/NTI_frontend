import { api } from 'lib/api/base-client';

import { unwrapAdminData } from '../shared/response';
import { adminOrganizationsEndpoints } from './endpoints';

import type {
  OrganizationInvite,
  OrganizationSummary,
  UpdateOrganizationStatusRequest,
} from './types';

export const adminOrganizationsService = {
  updateOrganizationStatus(id: string, payload: UpdateOrganizationStatusRequest) {
    return api.patch<OrganizationSummary, UpdateOrganizationStatusRequest>(
      adminOrganizationsEndpoints.updateOrganizationStatus(id),
      payload,
    );
  },

  async getOrganizationInvites() {
    const response = await api.get<OrganizationSummary[] | { data: OrganizationSummary[] }>(
      adminOrganizationsEndpoints.organizationInvites,
    );

    return unwrapAdminData(response);
  },

  async getOrganizationInvitesByOrganization(id: string) {
    const response = await api.get<OrganizationInvite[] | { data: OrganizationInvite[] }>(
      adminOrganizationsEndpoints.organizationInvitesByOrganization(id),
    );

    return unwrapAdminData(response);
  },
};
