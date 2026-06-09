'use client';

import type { QueryClient } from '@tanstack/react-query';

import {
  getProgramBBacklogControllerFindByIdQueryKey,
  getProgramBBacklogControllerListCandidatesQueryKey,
  getProgramBBacklogControllerListDocumentsQueryKey,
  getProgramBCompanyOverviewControllerGetBacklogSummaryQueryKey,
  getProgramBCompanyOverviewControllerGetOverviewQueryKey,
  getProgramBCompanyOverviewControllerGetProjectSummaryQueryKey,
  getProgramBProjectsControllerGetProjectQueryKey,
  getProgramBProjectsControllerListDocumentsQueryKey,
  getProgramBProjectsControllerListMentoringNotesQueryKey,
  getProgramBProjectsControllerListMilestonesQueryKey,
  getProgramBProjectsControllerListPoReviewsQueryKey,
} from 'lib/api';

type ProgramBWorkspaceIds = {
  backlogId?: string;
  projectId?: string;
};

export function getCompanyProgramBBacklogDetailLookupQueryKey(backlogId: string) {
  return ['company-program-b-backlog-detail-lookup', backlogId] as const;
}

export function invalidateProgramBCompanyWorkspace(
  queryClient: QueryClient,
  ids: ProgramBWorkspaceIds = {},
) {
  const invalidations = [
    queryClient.invalidateQueries({
      queryKey: getProgramBCompanyOverviewControllerGetOverviewQueryKey(),
    }),
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === '/program-b/company/backlog-summary',
    }),
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === '/program-b/company/project-summary',
    }),
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === '/program-b/backlog/my',
    }),
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === '/program-b/projects/my',
    }),
  ];

  if (ids.backlogId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: getCompanyProgramBBacklogDetailLookupQueryKey(ids.backlogId),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBBacklogControllerFindByIdQueryKey(ids.backlogId),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBBacklogControllerListCandidatesQueryKey(ids.backlogId),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBBacklogControllerListDocumentsQueryKey(ids.backlogId),
      }),
    );
  }

  if (ids.projectId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: getProgramBProjectsControllerGetProjectQueryKey(ids.projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBProjectsControllerListMilestonesQueryKey(ids.projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBProjectsControllerListPoReviewsQueryKey(ids.projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBProjectsControllerListMentoringNotesQueryKey(ids.projectId),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBProjectsControllerListDocumentsQueryKey(ids.projectId),
      }),
    );
  }

  return Promise.all(invalidations);
}

export {
  getProgramBCompanyOverviewControllerGetBacklogSummaryQueryKey,
  getProgramBCompanyOverviewControllerGetOverviewQueryKey,
  getProgramBCompanyOverviewControllerGetProjectSummaryQueryKey,
};
