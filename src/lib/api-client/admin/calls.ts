'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  adminCallsControllerArchive,
  adminCallsControllerClose,
  adminCallsControllerCreate,
  adminCallsControllerGetById,
  adminCallsControllerList,
  adminCallsControllerOpen,
  adminCallsControllerUpdate,
  getAdminCallsControllerGetByIdQueryKey,
  getAdminCallsControllerListQueryKey,
  type AdminCallsControllerListParams,
  type CreateAdminCallDto,
  type RequiredDocumentTypeDto,
  type UpdateAdminCallDto,
} from 'lib/api';

export const AdminCallStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type AdminCallStatus = (typeof AdminCallStatus)[keyof typeof AdminCallStatus];

export const AdminCallType = {
  PROGRAM_A: 'PROGRAM_A',
  PROGRAM_B: 'PROGRAM_B',
} as const;

export type AdminCallType = (typeof AdminCallType)[keyof typeof AdminCallType];

export type AdminCall = {
  id: string;
  title: string;
  type: AdminCallType;
  status: AdminCallStatus;
  opensAt?: string | null;
  closesAt?: string | null;
  createdAt: string;
  updatedAt: string;
  requiredDocumentTypes?: RequiredDocumentTypeDto[];
  categories?: unknown[];
  stackTags?: unknown[];
  minTeamSize?: number | null;
  maxTransferredSubjects?: number | null;
  maxProfileSubjectsAverage?: number | null;
};

export type AdminCallsResponse = {
  data: AdminCall[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function useAdminCalls(params?: AdminCallsControllerListParams) {
  return useQuery({
    queryKey: getAdminCallsControllerListQueryKey(params),
    queryFn: async () => {
      const response = await adminCallsControllerList(params);

      return response as unknown as AdminCallsResponse;
    },
  });
}

export function useAdminCall(id: string) {
  return useQuery({
    queryKey: getAdminCallsControllerGetByIdQueryKey(id),
    queryFn: async () => {
      const response = await adminCallsControllerGetById(id);

      return response as unknown as AdminCall;
    },
    enabled: id.trim().length > 0,
  });
}

export function useCreateAdminCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminCallDto) => adminCallsControllerCreate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerListQueryKey(),
      });
    },
  });
}

export function useUpdateAdminCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminCallDto }) =>
      adminCallsControllerUpdate(id, data),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerListQueryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerGetByIdQueryKey(variables.id),
      });
    },
  });
}

export function useOpenAdminCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCallsControllerOpen(id),
    onSuccess: async (_response, id) => {
      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerListQueryKey(),
      });

      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerGetByIdQueryKey(id),
      });
    },
  });
}

export function useCloseAdminCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCallsControllerClose(id),
    onSuccess: async (_response, id) => {
      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerListQueryKey(),
      });

      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerGetByIdQueryKey(id),
      });
    },
  });
}

export function useArchiveAdminCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCallsControllerArchive(id),
    onSuccess: async (_response, id) => {
      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerListQueryKey(),
      });

      await queryClient.invalidateQueries({
        queryKey: getAdminCallsControllerGetByIdQueryKey(id),
      });
    },
  });
}
