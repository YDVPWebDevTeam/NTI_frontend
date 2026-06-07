// This file is auto-generated. Do not edit manually.
import { useMutation } from '@tanstack/react-query';
import type { QueryClient, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import type {
  ApplicationProfileSectionValueDto,
  UpsertIdeaOverviewSectionDto,
} from '../index.schemas';

import { applicationsControllerUpsertIdeaOverviewSection } from './applications';

const IDEA_OVERVIEW_SECTION_KEY = 'idea_overview';

export interface UpsertApplicationSectionDto {
  valueJson: ApplicationProfileSectionValueDto | Record<string, unknown>;
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

