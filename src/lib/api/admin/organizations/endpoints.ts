import { buildPathWithId } from '../shared/path';

export const adminOrganizationsEndpoints = {
  updateOrganizationStatus: (id: string) => buildPathWithId('/admin/organizations', id) + '/status',
  organizationInvites: '/admin/organizations/invites',
  organizationInvitesByOrganization: (id: string) =>
    buildPathWithId('/admin/organizations', id) + '/invites',
} as const;
