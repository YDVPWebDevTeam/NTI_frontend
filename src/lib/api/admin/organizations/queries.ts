'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminQueryKeys } from '../admin-query-keys';
import { OrganizationStatus } from '../types';
import { adminOrganizationsService } from './service';
import type { OrganizationReviewStatus } from './types';

type ChangeOrganizationStatusInput = {
  id: string;
  status: OrganizationReviewStatus;
  rejectionReason?: string;
};

export function useOrganizationInvites() {
  return useQuery({
    queryKey: adminQueryKeys.organizationInvites(),
    queryFn: () => adminOrganizationsService.getOrganizationInvites(),
  });
}

export function useOrganizationInvitesByOrganization(id: string) {
  return useQuery({
    queryKey: adminQueryKeys.organizationInvitesByOrganization(id),
    queryFn: () => adminOrganizationsService.getOrganizationInvitesByOrganization(id),
    enabled: id.trim().length > 0,
  });
}

export function useChangeOrganizationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, rejectionReason }: ChangeOrganizationStatusInput) =>
      adminOrganizationsService.updateOrganizationStatus(id, {
        status,
        rejectionReason:
          status === OrganizationStatus.REJECTED
            ? (rejectionReason ?? 'Admin rejected')
            : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.organizationInvites(),
      });
    },
  });
}
