// This file is a thin compatibility layer for organization workspace callers.
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import openApiClient from 'lib/api-client/openapi-runtime/client';
import type {
  CompleteOrganizationDocumentUploadDto,
  CreateOrganizationDocumentUploadDto,
} from '../index.schemas';
import { getOrganizationDocumentsControllerListDocumentsQueryKey } from './organization-documents';

export interface OrganizationDocumentListItemCompat {
  id: string;
  name: string;
  version: number;
  visibility: string;
  documentType: string;
  status: string;
  sizeBytes: number;
  uploadedAt?: string;
}

export interface OrganizationDocumentUploadTicketCompat {
  documentId: string;
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface OrganizationDocumentDownloadCompat {
  documentId: string;
  downloadUrl: string;
  expiresAt?: string;
}

export { getOrganizationDocumentsControllerListDocumentsQueryKey };

export function organizationDocumentsControllerListDocumentsCompat(id: string) {
  return openApiClient<OrganizationDocumentListItemCompat[]>({
    url: `/organizations/${id}/documents`,
    method: 'GET',
  });
}

export function useOrganizationDocumentsControllerListDocumentsCompat<
  TData = OrganizationDocumentListItemCompat[],
  TError = unknown,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<OrganizationDocumentListItemCompat[], TError, TData>
    >;
    request?: Record<string, unknown>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> {
  const queryOptions = options?.query;

  return useQuery(
    {
      queryKey:
        queryOptions?.queryKey ?? getOrganizationDocumentsControllerListDocumentsQueryKey(id),
      queryFn: () => organizationDocumentsControllerListDocumentsCompat(id),
      enabled: Boolean(id) && (queryOptions?.enabled ?? true),
      ...queryOptions,
    },
    queryClient,
  );
}

export function organizationDocumentsControllerCreateUploadCompat(
  id: string,
  data: CreateOrganizationDocumentUploadDto,
) {
  return openApiClient<OrganizationDocumentUploadTicketCompat>({
    url: `/organizations/${id}/documents`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function useOrganizationDocumentsControllerCreateUploadCompat<
  TError = unknown,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      OrganizationDocumentUploadTicketCompat,
      TError,
      { id: string; data: CreateOrganizationDocumentUploadDto },
      TContext
    >;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  OrganizationDocumentUploadTicketCompat,
  TError,
  { id: string; data: CreateOrganizationDocumentUploadDto },
  TContext
> {
  return useMutation(
    {
      mutationKey: ['organizationDocumentsControllerCreateUploadCompat'],
      mutationFn: ({ id, data }) => organizationDocumentsControllerCreateUploadCompat(id, data),
      ...options?.mutation,
    },
    queryClient,
  );
}

export function organizationDocumentsControllerCompleteUploadCompat(
  id: string,
  docId: string,
  data: CompleteOrganizationDocumentUploadDto,
) {
  return openApiClient<void>({
    url: `/organizations/${id}/documents/${docId}/complete`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function useOrganizationDocumentsControllerCompleteUploadCompat<
  TError = unknown,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      void,
      TError,
      { id: string; docId: string; data: CompleteOrganizationDocumentUploadDto },
      TContext
    >;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  void,
  TError,
  { id: string; docId: string; data: CompleteOrganizationDocumentUploadDto },
  TContext
> {
  return useMutation(
    {
      mutationKey: ['organizationDocumentsControllerCompleteUploadCompat'],
      mutationFn: ({ id, docId, data }) =>
        organizationDocumentsControllerCompleteUploadCompat(id, docId, data),
      ...options?.mutation,
    },
    queryClient,
  );
}

export function organizationDocumentsControllerRequestDownloadCompat(id: string, docId: string) {
  return openApiClient<OrganizationDocumentDownloadCompat>({
    url: `/organizations/${id}/documents/${docId}/download`,
    method: 'GET',
  });
}
