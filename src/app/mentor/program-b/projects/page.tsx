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
            className={`rounded-2xl border p-5 shadow-sm ${
              project.status === ProgramBProjectDetailDtoStatus.CLOSED
                ? 'border-destructive/30 bg-destructive/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-foreground font-semibold">
                  {normalizeUnknownText(project.backlogItem.title) ?? t`Project`}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">{project.team.name}</p>
              </div>
              <CompanyStatusBadge status={project.status} />
            </div>
            <Link
              href={ROUTES.MENTOR.programBProjectDetail(project.id)}
              className="text-primary mt-4 inline-flex text-sm font-medium"
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
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <h1 className="text-foreground text-2xl font-semibold">{t`Program B projects`}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t`Projects where you provide mentoring support.`}
        </p>
      </section>

      {projectsContent}
    </div>
  );
}
