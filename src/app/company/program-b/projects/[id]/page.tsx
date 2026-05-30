'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';

import {
  CreateProgramBFinalAcceptanceDtoSide,
  ProgramBProjectDetailDtoStatus,
  ProgramBMilestoneDtoStatus,
  useProgramBProjectsControllerRecordFinalAcceptance,
  useProgramBProjectsControllerGetProject,
  useProgramBProjectsControllerListDocuments,
  useProgramBProjectsControllerListMilestones,
  useProgramBProjectsControllerListPoReviews,
  useProgramBProjectsControllerUpdateMilestone,
} from 'lib/api';
import { invalidateProgramBCompanyWorkspace } from 'lib/api-client/program-b-company';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import {
  CompanyDashboardStatus,
  CompanyStatusBadge,
} from 'components/company-dashboard/program-b-company-dashboard-primitives';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import {
  formatUnknownDate,
  normalizeUnknownDate,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { formatEnumLabel } from 'lib/utils';

const CONFLICT_STATUS = 409;

function formatPersonName(person: { firstName: string; lastName: string } | null | undefined) {
  if (!person) {
    return null;
  }

  return `${person.firstName} ${person.lastName}`.trim();
}

export default function CompanyProgramBProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const projectQuery = useProgramBProjectsControllerGetProject(id);
  const milestonesQuery = useProgramBProjectsControllerListMilestones(id);
  const reviewsQuery = useProgramBProjectsControllerListPoReviews(id);
  const documentsQuery = useProgramBProjectsControllerListDocuments(id);
  const recordFinalAcceptance = useProgramBProjectsControllerRecordFinalAcceptance();
  const updateMilestone = useProgramBProjectsControllerUpdateMilestone();
  const project = projectQuery.data;
  const milestones = milestonesQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const documents = documentsQuery.data ?? [];
  const isProjectReadOnly = project?.status === ProgramBProjectDetailDtoStatus.CLOSED;
  const hasCompanyFinalAcceptance = Boolean(project?.acceptedByCompanyAt);
  const hasOverdueMilestone = milestones.some((milestone) => {
    const normalizedDueAt = normalizeUnknownDate(milestone.dueAt);

    if (!normalizedDueAt) {
      return false;
    }

    return (
      new Date(normalizedDueAt).getTime() < Date.now() &&
      milestone.status !== ProgramBMilestoneDtoStatus.DONE
    );
  });

  const refreshWorkspace = async () => {
    await invalidateProgramBCompanyWorkspace(queryClient, { projectId: id });
  };

  const handleFinalAcceptance = async () => {
    try {
      await recordFinalAcceptance.mutateAsync({
        id,
        data: {
          side: CreateProgramBFinalAcceptanceDtoSide.COMPANY,
        },
      });
      toast.success(t`Final acceptance recorded.`);
      await refreshWorkspace();
    } catch (error) {
      if (isApiRequestError(error) && error.status === CONFLICT_STATUS) {
        toast.error(t`Closed Program B projects are read-only`);

        return;
      }

      toast.error(error instanceof Error ? error.message : t`Unable to record final acceptance.`);
    }
  };

  const handleMilestoneStatus = async (
    milestoneId: string,
    nextStatus: (typeof ProgramBMilestoneDtoStatus)[keyof typeof ProgramBMilestoneDtoStatus],
  ) => {
    try {
      await updateMilestone.mutateAsync({
        id,
        milestoneId,
        data: {
          status: nextStatus,
        },
      });
      toast.success(t`Milestone updated.`);
      await refreshWorkspace();
    } catch (error) {
      if (isApiRequestError(error) && error.status === CONFLICT_STATUS) {
        toast.error(t`Closed Program B projects are read-only`);

        return;
      }

      toast.error(error instanceof Error ? error.message : t`Unable to update milestone.`);
    }
  };

  let milestonesContent;

  if (milestonesQuery.isError) {
    milestonesContent = (
      <p className="text-sm text-[#60718d]">{t`Milestones are unavailable right now.`}</p>
    );
  } else if (milestones.length === 0) {
    milestonesContent = <p className="text-sm text-[#60718d]">{t`No milestones yet.`}</p>;
  } else {
    milestonesContent = milestones.map((milestone) => (
      <div key={milestone.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#10213d]">{milestone.title}</p>
            <p className="mt-1 text-sm text-[#60718d]">
              {normalizeUnknownText(milestone.description) ?? t`No milestone description.`}
            </p>
          </div>
          <CompanyStatusBadge status={milestone.status} />
        </div>
        <p className="mt-3 text-sm text-[#60718d]">
          {milestone.dueAt ? t`Due ${formatUnknownDate(milestone.dueAt)}` : t`No due date`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {milestone.status === ProgramBMilestoneDtoStatus.IN_PROGRESS ? null : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isProjectReadOnly || updateMilestone.isPending}
              onClick={() =>
                void handleMilestoneStatus(milestone.id, ProgramBMilestoneDtoStatus.IN_PROGRESS)
              }
            >
              {updateMilestone.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Mark in progress`}
            </Button>
          )}
          {milestone.status === ProgramBMilestoneDtoStatus.DONE ? null : (
            <Button
              type="button"
              size="sm"
              disabled={isProjectReadOnly || updateMilestone.isPending}
              onClick={() =>
                void handleMilestoneStatus(milestone.id, ProgramBMilestoneDtoStatus.DONE)
              }
            >
              {updateMilestone.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Mark done`}
            </Button>
          )}
          {milestone.status === ProgramBMilestoneDtoStatus.BLOCKED ? null : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isProjectReadOnly || updateMilestone.isPending}
              onClick={() =>
                void handleMilestoneStatus(milestone.id, ProgramBMilestoneDtoStatus.BLOCKED)
              }
            >
              {updateMilestone.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Mark blocked`}
            </Button>
          )}
        </div>
      </div>
    ));
  }

  let reviewsContent;

  if (reviewsQuery.isError) {
    reviewsContent = (
      <p className="text-sm text-[#60718d]">{t`Reviews are unavailable right now.`}</p>
    );
  } else if (reviews.length === 0) {
    reviewsContent = <p className="text-sm text-[#60718d]">{t`No reviews yet.`}</p>;
  } else {
    reviewsContent = reviews.map((review) => (
      <div key={review.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <p className="font-semibold text-[#10213d]">{review.decision}</p>
        <p className="mt-1 text-sm text-[#60718d]">
          {normalizeUnknownText(review.comment) ?? t`No comment`}
        </p>
      </div>
    ));
  }

  let documentsContent;

  if (documentsQuery.isError) {
    documentsContent = (
      <p className="text-sm text-[#60718d]">{t`Documents are unavailable right now.`}</p>
    );
  } else if (documents.length === 0) {
    documentsContent = <p className="text-sm text-[#60718d]">{t`No documents yet.`}</p>;
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

  if (projectQuery.isLoading && !project) {
    return (
      <CompanyDashboardStatus
        title={t`Loading project`}
        description={t`Resolving the Program B project detail for this organization.`}
      />
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <CompanyDashboardStatus
        title={t`Project is unavailable`}
        description={t`We could not load this Program B project right now.`}
        tone="danger"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#10213d]">
                {normalizeUnknownText(project.backlogItem.title) ?? t`Program B project`}
              </h1>
              <CompanyStatusBadge status={project.status} />
              {isProjectReadOnly ? (
                <span className="rounded-full bg-[#10213d] px-3 py-1 text-xs font-semibold text-white">
                  {t`Closed Program B projects are read-only`}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-[#60718d]">
              {isProjectReadOnly
                ? t`This project is closed and now read-only.`
                : formatEnumLabel(project.status)}
            </p>
          </div>
          <Link
            href={ROUTES.COMPANY.PROGRAM_B_PROJECTS}
            className="text-sm font-medium text-[#1e58d5]"
          >
            {t`Back to projects`}
          </Link>
        </div>
      </section>

      {hasCompanyFinalAcceptance && !hasOverdueMilestone ? null : (
        <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-amber-950">{t`Attention required`}</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-amber-900">
            {isProjectReadOnly ? (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                {t`This project is closed and now read-only.`}
              </span>
            ) : null}
            {hasCompanyFinalAcceptance ? null : (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                {t`Company final acceptance is still pending.`}
              </span>
            )}
            {hasOverdueMilestone ? (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                {t`At least one milestone is overdue and still needs status movement.`}
              </span>
            ) : null}
          </div>
          {hasCompanyFinalAcceptance ? null : (
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => void handleFinalAcceptance()}
                disabled={isProjectReadOnly || recordFinalAcceptance.isPending}
              >
                {recordFinalAcceptance.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t`Record company final acceptance`}
              </Button>
            </div>
          )}
        </article>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Overview`}</h2>
          <div className="mt-4 space-y-2 text-sm text-[#60718d]">
            <p>
              {t`Team:`}{' '}
              <span className="font-medium text-[#10213d]">
                {project.team.name ?? t`Unknown team`}
              </span>
            </p>
            <p>
              {t`Accepted:`}{' '}
              <span className="font-medium text-[#10213d]">
                {project.acceptedByCompanyAt
                  ? formatUnknownDate(project.acceptedByCompanyAt)
                  : t`Pending`}
              </span>
            </p>
            <p>
              {t`Product owner:`}{' '}
              <span className="font-medium text-[#10213d]">
                {formatPersonName(project.productOwner)}
              </span>
            </p>
            <p>
              {t`Mentor:`}{' '}
              <span className="font-medium text-[#10213d]">
                {formatPersonName(project.mentorAssignment.mentor) ?? t`Not assigned`}
              </span>
            </p>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Milestones`}</h2>
          <div className="mt-4 space-y-3">{milestonesContent}</div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Reviews`}</h2>
          <div className="mt-4 space-y-3">{reviewsContent}</div>
        </article>

        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Documents`}</h2>
          <div className="mt-4 space-y-3">{documentsContent}</div>
        </article>
      </div>
    </div>
  );
}
