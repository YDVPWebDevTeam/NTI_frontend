'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { organizationService } from './service';
import type { CreateOrganizationRequest } from './types';

export function useCreateOrganizationMutation() {
  return useMutation({
    mutationFn: (payload: CreateOrganizationRequest) =>
      organizationService.createOrganization(payload),
  });
}

export function useMyOrganizationQuery(enabled = true) {
  return useQuery({
    queryKey: ['organizations', 'me'],
    queryFn: () => organizationService.getMyOrganization(),
    enabled,
    retry: false,
  });
}
