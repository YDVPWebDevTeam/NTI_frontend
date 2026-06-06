'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import {
  ProgramBMilestoneDtoStatus,
  type ProgramBProjectDetailDto,
  ProgramBProjectDetailDtoStatus,
  useProgramBProjectsControllerListMy,
} from 'lib/api';
import {
  CompanyDashboardLoadingCard,
  CompanyDashboardStatus,
  CompanyStatusBadge,
} from 'components/company-dashboard/program-b-company-dashboard-primitives';
import { ROUTES } from 'lib/constants';
import {
  formatUnknownDate,
  normalizeUnknownDate,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';

function getMilestoneTimestamp(value: unknown): number | null {
  const normalizedDate = normalizeUnknownDate(value);

  if (!normalizedDate) {
    return null;
  }

  const timestamp = new Date(normalizedDate).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function getNextMilestone(project: ProgramBProjectDetailDto) {
  const unfinishedMilestones = project.milestones.filter(
    (milestone) => milestone.status !== ProgramBMilestoneDtoStatus.DONE,
  );

  return (
    [...unfinishedMilestones].sort((first, second) => {
      const firstDueAt = getMilestoneTimestamp(first.dueAt);
      const secondDueAt = getMilestoneTimestamp(second.dueAt);

      if (firstDueAt === null && secondDueAt === null) {
        return 0;
      }

      if (firstDueAt === null) {
        return 1;
      }

      if (secondDueAt === null) {
        return -1;
      }

      return firstDueAt - secondDueAt;
    })[0] ?? null
  );
}

export default function MentorDashboardPage() {
  const projectsQuery = useProgramBProjectsControllerListMy();
  const projects = projectsQuery.data ?? [];

  let projectsContent;

  if (projectsQuery.isLoading && !projectsQuery.data) {
    projectsContent = (
      <div className="grid gap-4 lg:grid-cols-2">
        <CompanyDashboardLoadingCard />
        <CompanyDashboardLoadingCard />
      </div>
    );
  } else if (projectsQuery.isError && !projectsQuery.data) {
    projectsContent = (
      <CompanyDashboardStatus
        title={t`Unable to load projects`}
        description={t`Your assigned Program B projects could not be loaded right now.`}
        tone="danger"
      />
    );
  } else if (projects.length === 0) {
    projectsContent = (
      <CompanyDashboardStatus
        title={t`No projects assigned yet`}
        description={t`Program B projects assigned to you as a mentor will appear here.`}
      />
    );
  } else {
    projectsContent = (
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => {
          const nextMilestone = getNextMilestone(project);

          return (
            <article
              key={project.id}
              className={`rounded-[1.5rem] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${
                project.status === ProgramBProjectDetailDtoStatus.CLOSED
                  ? 'border-rose-200 bg-[linear-gradient(180deg,#ffffff_0%,#fff3f3_100%)]'
                  : 'border-[#dfe7fa] bg-white/90'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#10213d]">
                    {normalizeUnknownText(project.backlogItem.title) ?? t`Program B project`}
                  </h2>

                  <p className="mt-2 text-sm text-[#60718d]">
                    {t`Team:`} {project.team.name ?? t`Unknown team`}
                  </p>
                </div>

                <CompanyStatusBadge status={project.status} />
              </div>

              <div className="mt-4 rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#60718d] uppercase">
                  {t`Next milestone`}
                </p>

                {nextMilestone ? (
                  <>
                    <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                      <p className="font-medium text-[#10213d]">{nextMilestone.title}</p>

                      <CompanyStatusBadge status={nextMilestone.status} />
                    </div>

                    <p className="mt-2 text-sm text-[#60718d]">
                      {nextMilestone.dueAt
                        ? t`Due ${formatUnknownDate(nextMilestone.dueAt)}`
                        : t`No due date`}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[#60718d]">{t`No upcoming milestone`}</p>
                )}
              </div>

              <Link
                href={ROUTES.MENTOR.programBProjectDetail(project.id)}
                className="mt-4 inline-flex text-sm font-medium text-[#1e58d5]"
              >
                {t`Open project`}
              </Link>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold text-[#10213d]">{t`Mentor dashboard`}</h1>

        <p className="mt-2 text-sm text-[#60718d]">
          {t`Review your assigned Program B projects and their upcoming milestones.`}
        </p>
      </section>

      {projectsContent}
    </div>
  );
}
