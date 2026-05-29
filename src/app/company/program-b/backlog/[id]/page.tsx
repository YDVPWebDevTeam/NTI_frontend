'use client';

import { t } from '@lingui/core/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { toast } from 'sonner';

import {
  programBBacklogControllerListMy,
  ProgramBBacklogItemDtoStatus,
  ProgramBTeamApplicationResponseDtoStatus,
  useProgramBBacklogControllerAcceptCandidate,
  useProgramBBacklogControllerAssignProductOwner,
  useProgramBBacklogControllerCreateProject,
  useProgramBBacklogControllerFindPublishedById,
  useProgramBBacklogControllerRejectCandidate,
  useProgramBBacklogControllerListCandidates,
  useProgramBBacklogControllerListDocuments,
  useProgramBBacklogControllerShortlistCandidate,
} from 'lib/api';
import {
  getCompanyProgramBBacklogDetailLookupQueryKey,
  invalidateProgramBCompanyWorkspace,
} from 'lib/api-client/program-b-company';
import {
  CompanyDashboardStatus,
  CompanyStatusBadge,
} from 'components/company-dashboard/program-b-company-dashboard-primitives';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
import { formatUnknownDate, normalizeUnknownText } from 'lib/student-dashboard/normalizers';

const BACKLOG_LOOKUP_PAGE_SIZE = 100;

function formatPersonName(person: { firstName: string; lastName: string } | null | undefined) {
  if (!person) {
    return null;
  }

  return `${person.firstName} ${person.lastName}`.trim();
}

export default function CompanyProgramBBacklogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { me } = useAuthenticatedUser();
  const companyBacklogLookupQuery = useQuery({
    queryKey: getCompanyProgramBBacklogDetailLookupQueryKey(id),
    enabled: Boolean(id),
    retry: false,
    queryFn: async () => {
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const response = await programBBacklogControllerListMy({
          page,
          limit: BACKLOG_LOOKUP_PAGE_SIZE,
        });
        const matchingItem = response.data.find((backlogItem) => backlogItem.id === id);

        if (matchingItem) {
          return matchingItem;
        }

        totalPages = response.meta.totalPages;
        page += 1;
      }

      return null;
    },
  });
  const companyBacklogItem = companyBacklogLookupQuery.data ?? null;
  const canLoadCompanyBacklogRelatedData = Boolean(companyBacklogItem);
  const shouldLoadPublishedDetail =
    companyBacklogItem?.status === ProgramBBacklogItemDtoStatus.PUBLISHED;
  const isPublishedDetailUnavailable =
    canLoadCompanyBacklogRelatedData && !shouldLoadPublishedDetail;
  const itemQuery = useProgramBBacklogControllerFindPublishedById(id, {
    query: {
      enabled: shouldLoadPublishedDetail,
      retry: false,
    },
  });
  const candidatesQuery = useProgramBBacklogControllerListCandidates(id, {
    query: {
      enabled: canLoadCompanyBacklogRelatedData,
      retry: false,
    },
  });
  const documentsQuery = useProgramBBacklogControllerListDocuments(id, {
    query: {
      enabled: canLoadCompanyBacklogRelatedData,
      retry: false,
    },
  });
  const assignProductOwner = useProgramBBacklogControllerAssignProductOwner();
  const shortlistCandidate = useProgramBBacklogControllerShortlistCandidate();
  const acceptCandidate = useProgramBBacklogControllerAcceptCandidate();
  const rejectCandidate = useProgramBBacklogControllerRejectCandidate();
  const createProject = useProgramBBacklogControllerCreateProject();
  const item = itemQuery.data ?? companyBacklogItem;
  const candidates = candidatesQuery.data?.data ?? [];
  const documents = documentsQuery.data ?? [];
  const hasPendingCandidateReview = candidates.some(
    (candidate) =>
      candidate.status === ProgramBTeamApplicationResponseDtoStatus.SUBMITTED ||
      candidate.status === ProgramBTeamApplicationResponseDtoStatus.SHORTLISTED,
  );

  const refreshWorkspace = async () => {
    await invalidateProgramBCompanyWorkspace(queryClient, { backlogId: id });
  };

  const handleAssignMyself = async () => {
    if (!me) {
      return;
    }

    try {
      await assignProductOwner.mutateAsync({
        id,
        data: {
          productOwnerUserId: me.id,
        },
      });
      toast.success(t`Product owner assigned.`);
      await refreshWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to assign product owner.`);
    }
  };

  const handleCandidateDecision = async (
    applicationId: string,
    action: 'shortlist' | 'accept' | 'reject',
  ) => {
    try {
      if (action === 'shortlist') {
        await shortlistCandidate.mutateAsync({
          id,
          applicationId,
          data: {},
        });
        toast.success(t`Candidate shortlisted.`);
      }

      if (action === 'accept') {
        await acceptCandidate.mutateAsync({
          id,
          applicationId,
          data: {},
        });
        toast.success(t`Candidate accepted.`);
      }

      if (action === 'reject') {
        await rejectCandidate.mutateAsync({
          id,
          applicationId,
          data: {},
        });
        toast.success(t`Candidate rejected.`);
      }

      await refreshWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to update candidate status.`);
    }
  };

  const handleCreateProject = async (applicationId: string) => {
    try {
      const project = await createProject.mutateAsync({
        id,
        applicationId,
      });

      toast.success(t`Project workspace created.`);
      await invalidateProgramBCompanyWorkspace(queryClient, {
        backlogId: id,
        projectId: project.id,
      });
      router.push(ROUTES.COMPANY.programBProjectDetail(project.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to create project.`);
    }
  };

  let candidatesContent;

  if (candidatesQuery.isLoading && !candidatesQuery.data) {
    candidatesContent = <p className="text-sm text-[#60718d]">{t`Loading candidates…`}</p>;
  } else if (candidatesQuery.isError) {
    candidatesContent = (
      <p className="text-sm text-[#60718d]">{t`Candidates are unavailable right now.`}</p>
    );
  } else if (candidates.length === 0) {
    candidatesContent = <p className="text-sm text-[#60718d]">{t`No candidates yet.`}</p>;
  } else {
    candidatesContent = candidates.map((candidate) => (
      <div key={candidate.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#10213d]">
              {t`Team:`} {candidate.teamId}
            </p>
            <p className="mt-1 text-sm text-[#60718d]">
              {t`Submitted:`} {formatUnknownDate(candidate.submittedAt)}
            </p>
          </div>
          <CompanyStatusBadge status={candidate.status} />
        </div>

        <p className="mt-3 text-sm leading-7 text-[#60718d]">
          {normalizeUnknownText(candidate.motivation) ?? t`No motivation provided.`}
        </p>

        {candidate.decisionReason ? (
          <p className="mt-2 text-sm text-[#60718d]">
            {t`Decision note:`} {candidate.decisionReason}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.status === ProgramBTeamApplicationResponseDtoStatus.SUBMITTED ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={shortlistCandidate.isPending}
              onClick={() => void handleCandidateDecision(candidate.id, 'shortlist')}
            >
              {shortlistCandidate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t`Shortlist`}
            </Button>
          ) : null}

          {candidate.status === ProgramBTeamApplicationResponseDtoStatus.SUBMITTED ||
          candidate.status === ProgramBTeamApplicationResponseDtoStatus.SHORTLISTED ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={acceptCandidate.isPending}
                onClick={() => void handleCandidateDecision(candidate.id, 'accept')}
              >
                {acceptCandidate.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t`Accept`}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={rejectCandidate.isPending}
                onClick={() => void handleCandidateDecision(candidate.id, 'reject')}
              >
                {rejectCandidate.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t`Reject`}
              </Button>
            </>
          ) : null}

          {candidate.status === ProgramBTeamApplicationResponseDtoStatus.ACCEPTED ? (
            <Button
              type="button"
              size="sm"
              disabled={createProject.isPending}
              onClick={() => void handleCreateProject(candidate.id)}
            >
              {createProject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Create project workspace`}
            </Button>
          ) : null}
        </div>
      </div>
    ));
  }

  let documentsContent;

  if (documentsQuery.isLoading && !documentsQuery.data) {
    documentsContent = <p className="text-sm text-[#60718d]">{t`Loading documents…`}</p>;
  } else if (documentsQuery.isError) {
    documentsContent = (
      <p className="text-sm text-[#60718d]">{t`Documents are unavailable right now.`}</p>
    );
  } else if (documents.length === 0) {
    documentsContent = <p className="text-sm text-[#60718d]">{t`No documents uploaded yet.`}</p>;
  } else {
    documentsContent = documents.map((document) => (
      <div key={document.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <p className="font-semibold text-[#10213d]">{document.name}</p>
        <p className="mt-1 text-sm text-[#60718d]">
          {document.category} · {document.status}
        </p>
      </div>
    ));
  }

  if ((companyBacklogLookupQuery.isLoading || itemQuery.isLoading) && !item) {
    return (
      <CompanyDashboardStatus
        title={t`Loading backlog item`}
        description={t`Resolving the Program B backlog detail for this organization.`}
      />
    );
  }

  if (companyBacklogItem === null || (shouldLoadPublishedDetail && itemQuery.isError) || !item) {
    return (
      <CompanyDashboardStatus
        title={t`Backlog item is unavailable`}
        description={t`We could not load this Program B backlog item right now.`}
        tone="danger"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#10213d]">
              {normalizeUnknownText(item.title) ?? t`Program B backlog item`}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#60718d]">
              {normalizeUnknownText(item.description) ?? t`No description provided.`}
            </p>
          </div>
          <Link
            href={ROUTES.COMPANY.PROGRAM_B_BACKLOG}
            className="text-sm font-medium text-[#1e58d5]"
          >
            {t`Back to backlog`}
          </Link>
        </div>
      </section>

      {isPublishedDetailUnavailable ? (
        <CompanyDashboardStatus
          title={t`Using organization backlog data`}
          description={t`This backlog item is in an internal company workflow state, so this page is showing the organization-scoped workspace summary instead of the published-detail endpoint.`}
        />
      ) : null}

      {item.productOwner && !hasPendingCandidateReview ? null : (
        <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-amber-950">{t`Attention required`}</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-amber-900">
            {item.productOwner ? null : (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                {t`Product owner still needs assignment.`}
              </span>
            )}
            {hasPendingCandidateReview ? (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                {t`Candidate decisions are waiting in this backlog item.`}
              </span>
            ) : null}
          </div>
          {!item.productOwner && me ? (
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => void handleAssignMyself()}
                disabled={assignProductOwner.isPending}
              >
                {assignProductOwner.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t`Assign myself as product owner`}
              </Button>
            </div>
          ) : null}
        </article>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Overview`}</h2>
          <div className="mt-4 space-y-2 text-sm text-[#60718d]">
            <p>
              {t`Status:`}{' '}
              <span className="align-middle">
                <CompanyStatusBadge status={item.status} />
              </span>
            </p>
            <p>
              {t`Budget:`}{' '}
              <span className="font-medium text-[#10213d]">
                {normalizeUnknownText(item.budget) ?? t`Not specified`}
              </span>
            </p>
            <p>
              {t`Updated:`}{' '}
              <span className="font-medium text-[#10213d]">
                {formatUnknownDate(item.updatedAt)}
              </span>
            </p>
            <p>
              {t`Product owner:`}{' '}
              <span className="font-medium text-[#10213d]">
                {formatPersonName(item.productOwner) ?? t`Not assigned`}
              </span>
            </p>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Candidates`}</h2>
          <div className="mt-4 space-y-3">{candidatesContent}</div>
        </article>
      </div>

      <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-[#10213d]">{t`Documents`}</h2>
        <div className="mt-4 space-y-3">{documentsContent}</div>
      </article>
    </div>
  );
}
