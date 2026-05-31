'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import { ProgramBProjectDetailDtoStatus, useProgramBProjectsControllerListMy } from 'lib/api';
import {
  CompanyDashboardLoadingCard,
  CompanyStatusBadge,
  CompanyDashboardStatus,
} from 'components/company-dashboard/program-b-company-dashboard-primitives';
import { ROUTES } from 'lib/constants';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export default function MentorProgramBProjectsPage() {
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
        description={t`The Program B project list could not be loaded right now.`}
        tone="danger"
      />
    );
  } else if (projects.length === 0) {
    projectsContent = (
      <CompanyDashboardStatus
        title={t`No assigned projects`}
        description={t`Program B projects where you are the assigned mentor will appear here.`}
      />
    );
  } else {
    projectsContent = (
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => (
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
                <p className="font-semibold text-[#10213d]">
                  {normalizeUnknownText(project.backlogItem.title) ?? t`Project`}
                </p>
                <p className="mt-2 text-sm text-[#60718d]">{project.team.name}</p>
              </div>
              <CompanyStatusBadge status={project.status} />
            </div>
            <Link
              href={ROUTES.MENTOR.programBProjectDetail(project.id)}
              className="mt-4 inline-flex text-sm font-medium text-[#1e58d5]"
            >
              {t`Open project`}
            </Link>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold text-[#10213d]">{t`Program B projects`}</h1>
        <p className="mt-2 text-sm text-[#60718d]">
          {t`Projects where you provide mentoring support.`}
        </p>
      </section>

      {projectsContent}
    </div>
  );
}
