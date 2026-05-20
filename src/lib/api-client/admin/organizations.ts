'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { OrganizationStatus } from 'lib/api-client/admin/types';
import {
  adminUpdateOrganizationStatus,
  getAdminListOrganizationInvitesByOrganizationQueryKey,
  getAdminListOrganizationInvitesQueryKey,
  useAdminListOrganizationInvitesByOrganization,
  useAdminListOrganizations,
  type AdminUpdateOrganizationStatusMutationBody,
} from 'lib/api';

export type ChangeOrganizationStatusInput = {
  id: string;
  status: AdminUpdateOrganizationStatusMutationBody['status'];
  rejectionReason?: string;
};

export function useOrganizationInvites() {
  return useAdminListOrganizations(undefined, {
    query: {
      select: (response) => response.data,
    },
  });
}

export function useOrganizationInvitesByOrganization(id: string) {
  return useAdminListOrganizationInvitesByOrganization(id, {
    query: {
      enabled: id.trim().length > 0,
    },
  });
}

export function useChangeOrganizationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, rejectionReason }: ChangeOrganizationStatusInput) =>
      adminUpdateOrganizationStatus(id, {
        status,
        rejectionReason:
          status === OrganizationStatus.REJECTED
            ? (rejectionReason ?? 'Admin rejected')
            : undefined,
      }),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getAdminListOrganizationInvitesQueryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: getAdminListOrganizationInvitesByOrganizationQueryKey(variables.id),
      });
    },
  });
}
