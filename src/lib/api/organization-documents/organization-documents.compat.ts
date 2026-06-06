'use client';

import {
  useMutation,
  useQuery,
  type DataTag,
  type DefinedInitialDataOptions,
  type DefinedUseQueryResult,
  type MutationFunction,
  type QueryClient,
  type QueryFunction,
  type QueryKey,
  type UndefinedInitialDataOptions,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import type {
  CompleteOrganizationDocumentUploadDto,
  CreateOrganizationDocumentUploadDto,
} from '../index.schemas';
import { orvalMutator } from '../../api-client/openapi-runtime/runtime';
import {
  getOrganizationDocumentsControllerListDocumentsQueryKey,
  getOrganizationDocumentsControllerRequestDownloadQueryKey,
} from './organization-documents';

type SecondParameter<T extends (...args: never[]) => unknown> = Parameters<T>[1];

export type OrganizationDocumentVisibility = 'INTERNAL' | 'CONFIDENTIAL';
export type OrganizationDocumentUploadStatus = 'PENDING' | 'UPLOADED' | 'FAILED';

export interface OrganizationDocumentDto {
  id: string;
  name: string;
  documentType: string;
  version: number;
  mimeType: string;
  sizeBytes: number;
  checksum?: string | null;
  visibility: OrganizationDocumentVisibility;
  status: OrganizationDocumentUploadStatus | string;
  uploadedById: string;
  uploadedAt?: string;
  createdAt: string;
}

export interface OrganizationDocumentUploadDto {
  documentId: string;
  version: number;
  visibility: OrganizationDocumentVisibility;
  status: OrganizationDocumentUploadStatus | string;
  uploadUrl: string;
  expiresAt: string;
  checksum?: string;
}

export interface OrganizationDocumentDownloadDto {
  documentId: string;
  downloadUrl: string;
  expiresAt: string;
}

export const organizationDocumentsControllerListDocumentsCompat = (
  id: string,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) =>
  orvalMutator<OrganizationDocumentDto[]>(
    {
      url: `/organizations/${id}/documents`,
      method: 'GET',
      signal,
    },
    options,
  );

export const getOrganizationDocumentsControllerListDocumentsCompatQueryOptions = <
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
  TError = unknown,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getOrganizationDocumentsControllerListDocumentsQueryKey(id);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>
  > = ({ signal }) => organizationDocumentsControllerListDocumentsCompat(id, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export function useOrganizationDocumentsControllerListDocumentsCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
  TError = unknown,
>(
  id: string,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
          TError,
          Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useOrganizationDocumentsControllerListDocumentsCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
  TError = unknown,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
          TError,
          Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useOrganizationDocumentsControllerListDocumentsCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
  TError = unknown,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useOrganizationDocumentsControllerListDocumentsCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
  TError = unknown,
>(
  id: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerListDocumentsCompat>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getOrganizationDocumentsControllerListDocumentsCompatQueryOptions(
    id,
    options,
  );
  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const organizationDocumentsControllerCreateUploadCompat = (
  id: string,
  createOrganizationDocumentUploadDto: CreateOrganizationDocumentUploadDto,
  options?: SecondParameter<typeof orvalMutator>,
) =>
  orvalMutator<OrganizationDocumentUploadDto>(
    {
      url: `/organizations/${id}/documents`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: createOrganizationDocumentUploadDto,
    },
    options,
  );

export const getOrganizationDocumentsControllerCreateUploadCompatMutationOptions = <
  TError = unknown,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof organizationDocumentsControllerCreateUploadCompat>>,
      TError,
      { id: string; data: CreateOrganizationDocumentUploadDto },
      TContext
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof organizationDocumentsControllerCreateUploadCompat>>,
  TError,
  { id: string; data: CreateOrganizationDocumentUploadDto },
  TContext
> => {
  const mutationKey = ['organizationDocumentsControllerCreateUploadCompat'];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof organizationDocumentsControllerCreateUploadCompat>>,
    { id: string; data: CreateOrganizationDocumentUploadDto }
  > = (props) => {
    const { id, data } = props;

    return organizationDocumentsControllerCreateUploadCompat(id, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export const useOrganizationDocumentsControllerCreateUploadCompat = <
  TError = unknown,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof organizationDocumentsControllerCreateUploadCompat>>,
      TError,
      { id: string; data: CreateOrganizationDocumentUploadDto },
      TContext
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof organizationDocumentsControllerCreateUploadCompat>>,
  TError,
  { id: string; data: CreateOrganizationDocumentUploadDto },
  TContext
> => {
  const mutationOptions = getOrganizationDocumentsControllerCreateUploadCompatMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};

export const organizationDocumentsControllerCompleteUploadCompat = (
  id: string,
  docId: string,
  completeOrganizationDocumentUploadDto: CompleteOrganizationDocumentUploadDto,
  options?: SecondParameter<typeof orvalMutator>,
) =>
  orvalMutator<OrganizationDocumentDto>(
    {
      url: `/organizations/${id}/documents/${docId}/complete`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: completeOrganizationDocumentUploadDto,
    },
    options,
  );

export const getOrganizationDocumentsControllerCompleteUploadCompatMutationOptions = <
  TError = unknown,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof organizationDocumentsControllerCompleteUploadCompat>>,
      TError,
      { id: string; docId: string; data: CompleteOrganizationDocumentUploadDto },
      TContext
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof organizationDocumentsControllerCompleteUploadCompat>>,
  TError,
  { id: string; docId: string; data: CompleteOrganizationDocumentUploadDto },
  TContext
> => {
  const mutationKey = ['organizationDocumentsControllerCompleteUploadCompat'];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof organizationDocumentsControllerCompleteUploadCompat>>,
    { id: string; docId: string; data: CompleteOrganizationDocumentUploadDto }
  > = (props) => {
    const { id, docId, data } = props;

    return organizationDocumentsControllerCompleteUploadCompat(id, docId, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export const useOrganizationDocumentsControllerCompleteUploadCompat = <
  TError = unknown,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof organizationDocumentsControllerCompleteUploadCompat>>,
      TError,
      { id: string; docId: string; data: CompleteOrganizationDocumentUploadDto },
      TContext
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof organizationDocumentsControllerCompleteUploadCompat>>,
  TError,
  { id: string; docId: string; data: CompleteOrganizationDocumentUploadDto },
  TContext
> => {
  const mutationOptions =
    getOrganizationDocumentsControllerCompleteUploadCompatMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};

export const organizationDocumentsControllerRequestDownloadCompat = (
  id: string,
  docId: string,
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) =>
  orvalMutator<OrganizationDocumentDownloadDto>(
    {
      url: `/organizations/${id}/documents/${docId}/download`,
      method: 'GET',
      signal,
    },
    options,
  );

export const getOrganizationDocumentsControllerRequestDownloadCompatQueryOptions = <
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
  TError = unknown,
>(
  id: string,
  docId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ??
    getOrganizationDocumentsControllerRequestDownloadQueryKey(id, docId);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>
  > = ({ signal }) =>
    organizationDocumentsControllerRequestDownloadCompat(id, docId, requestOptions, signal);

  return {
    queryKey,
    queryFn,
    enabled: !!(id && docId),
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export function useOrganizationDocumentsControllerRequestDownloadCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
  TError = unknown,
>(
  id: string,
  docId: string,
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
          TError,
          Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useOrganizationDocumentsControllerRequestDownloadCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
  TError = unknown,
>(
  id: string,
  docId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
          TError,
          Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useOrganizationDocumentsControllerRequestDownloadCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
  TError = unknown,
>(
  id: string,
  docId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useOrganizationDocumentsControllerRequestDownloadCompat<
  TData = Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
  TError = unknown,
>(
  id: string,
  docId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof organizationDocumentsControllerRequestDownloadCompat>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getOrganizationDocumentsControllerRequestDownloadCompatQueryOptions(
    id,
    docId,
    options,
  );
  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
