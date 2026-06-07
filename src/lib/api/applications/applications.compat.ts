// This file is auto-generated. Do not edit manually.
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type {
  ApplicationProfileSectionValueDto,
  UpsertIdeaOverviewSectionDto,
} from '../index.schemas';
import { orvalMutator } from '../../api-client/openapi-runtime/runtime';

import { applicationsControllerUpsertIdeaOverviewSection } from './applications';

const IDEA_OVERVIEW_SECTION_KEY = 'idea_overview';

export interface UpsertApplicationSectionDto {
  valueJson: ApplicationProfileSectionValueDto | Record<string, unknown>;
}

type SecondParameter<T extends (...args: never[]) => unknown> = Parameters<T>[1];

export type StudentApplicationCallSummaryDtoType = 'PROGRAM_A' | 'PROGRAM_B';
export type StudentApplicationCallSummaryDtoStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'CLOSED'
  | 'ARCHIVED';

export interface StudentApplicationCallSummaryDto {
  id: string;
  title: string;
  type: StudentApplicationCallSummaryDtoType;
  status: StudentApplicationCallSummaryDtoStatus;
}

export type StudentApplicationSummaryDtoStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'FORMALLY_VERIFIED'
  | 'EVALUATING'
  | 'NEEDS_INFO'
  | 'APPROVED'
  | 'REJECTED'
  | 'ONBOARDING'
  | 'ACTIVE_PROJECT'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface StudentApplicationSummaryDto {
  id: string;
  callId: string;
  teamId: string;
  status: StudentApplicationSummaryDtoStatus;
  submittedAt?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  call: StudentApplicationCallSummaryDto;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeUpsertApplicationSectionDto(
  payload: UpsertApplicationSectionDto,
): UpsertIdeaOverviewSectionDto {
  const valueJson = payload.valueJson as Record<string, unknown>;

  if (
    isNonEmptyString(valueJson.problem) &&
    isNonEmptyString(valueJson.solution) &&
    isNonEmptyString(valueJson.targetUsers) &&
    isNonEmptyString(valueJson.valueProposition)
  ) {
    return {
      problem: valueJson.problem,
      solution: valueJson.solution,
      targetUsers: valueJson.targetUsers,
      valueProposition: valueJson.valueProposition,
    };
  }

  throw new Error(
    'The generated API now expects idea overview fields: problem, solution, targetUsers, and valueProposition.',
  );
}

function assertSupportedSectionKey(key: string) {
  if (key !== IDEA_OVERVIEW_SECTION_KEY) {
    throw new Error(
      `Unsupported application section key "${key}". The current API only supports "${IDEA_OVERVIEW_SECTION_KEY}".`,
    );
  }
}

export const applicationsControllerUpsertSection = (
  applicationId: string,
  key: string,
  upsertApplicationSectionDto: UpsertApplicationSectionDto,
  options?: Parameters<typeof applicationsControllerUpsertIdeaOverviewSection>[2],
) => {
  assertSupportedSectionKey(key);

  return applicationsControllerUpsertIdeaOverviewSection(
    applicationId,
    normalizeUpsertApplicationSectionDto(upsertApplicationSectionDto),
    options,
  );
};

export const getApplicationsControllerUpsertSectionMutationOptions = <
  TError = void,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof applicationsControllerUpsertSection>>,
    TError,
    { applicationId: string; key: string; data: UpsertApplicationSectionDto },
    TContext
  >;
  request?: Parameters<typeof applicationsControllerUpsertIdeaOverviewSection>[2];
}): UseMutationOptions<
  Awaited<ReturnType<typeof applicationsControllerUpsertSection>>,
  TError,
  { applicationId: string; key: string; data: UpsertApplicationSectionDto },
  TContext
> => {
  const mutationKey = ['applicationsControllerUpsertSection'];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn = (props: {
    applicationId: string;
    key: string;
    data: UpsertApplicationSectionDto;
  }) => {
    const { applicationId, key, data } = props;

    return applicationsControllerUpsertSection(applicationId, key, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type ApplicationsControllerUpsertSectionMutationResult = NonNullable<
  Awaited<ReturnType<typeof applicationsControllerUpsertSection>>
>;
export type ApplicationsControllerUpsertSectionMutationBody = UpsertApplicationSectionDto;
export type ApplicationsControllerUpsertSectionMutationError = void;

export const useApplicationsControllerUpsertSection = <
  TError = void,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof applicationsControllerUpsertSection>>,
      TError,
      { applicationId: string; key: string; data: UpsertApplicationSectionDto },
      TContext
    >;
    request?: Parameters<typeof applicationsControllerUpsertIdeaOverviewSection>[2];
  },
  queryClient?: QueryClient,
): UseMutationResult<
  Awaited<ReturnType<typeof applicationsControllerUpsertSection>>,
  TError,
  { applicationId: string; key: string; data: UpsertApplicationSectionDto },
  TContext
> => {
  const mutationOptions = getApplicationsControllerUpsertSectionMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};

export const applicationsControllerListSubmittedForCurrentTeam = (
  options?: SecondParameter<typeof orvalMutator>,
  signal?: AbortSignal,
) =>
  orvalMutator<StudentApplicationSummaryDto[]>(
    {
      url: '/applications/team/current/submitted',
      method: 'GET',
      signal,
    },
    options,
  );

export const getApplicationsControllerListSubmittedForCurrentTeamQueryKey = () =>
  ['/applications/team/current/submitted'] as const;

export const getApplicationsControllerListSubmittedForCurrentTeamQueryOptions = <
  TData = Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
  TError = void,
>(options?: {
  query?: Partial<
    UseQueryOptions<
      Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
      TError,
      TData
    >
  >;
  request?: SecondParameter<typeof orvalMutator>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ?? getApplicationsControllerListSubmittedForCurrentTeamQueryKey();

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>
  > = ({ signal }) => applicationsControllerListSubmittedForCurrentTeam(requestOptions, signal);

  return {
    queryKey,
    queryFn,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type ApplicationsControllerListSubmittedForCurrentTeamQueryResult = NonNullable<
  Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>
>;
export type ApplicationsControllerListSubmittedForCurrentTeamQueryError = void;

export function useApplicationsControllerListSubmittedForCurrentTeam<
  TData = Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
  TError = void,
>(
  options: {
    query: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
        TError,
        TData
      >
    > &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
          TError,
          Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useApplicationsControllerListSubmittedForCurrentTeam<
  TData = Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
  TError = void,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
        TError,
        TData
      >
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
          TError,
          Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useApplicationsControllerListSubmittedForCurrentTeam<
  TData = Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
  TError = void,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useApplicationsControllerListSubmittedForCurrentTeam<
  TData = Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
  TError = void,
>(
  options?: {
    query?: Partial<
      UseQueryOptions<
        Awaited<ReturnType<typeof applicationsControllerListSubmittedForCurrentTeam>>,
        TError,
        TData
      >
    >;
    request?: SecondParameter<typeof orvalMutator>;
  },
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getApplicationsControllerListSubmittedForCurrentTeamQueryOptions(options);
  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
