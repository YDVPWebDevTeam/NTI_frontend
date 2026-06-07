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

export default function CompanyProgramBProjectsPage() {
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
        title={t`Unable to load company projects`}
        description={t`The Program B project list could not be loaded right now.`}
        tone="danger"
      />
    );
  } else if (projects.length === 0) {
    projectsContent = (
      <CompanyDashboardStatus
        title={t`No projects yet`}
        description={t`Projects created from accepted Program B candidates will appear here.`}
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

            {project.status === ProgramBProjectDetailDtoStatus.CLOSED ? (
              <div className="border-destructive/30 bg-card/80 text-destructive mt-4 rounded-xl border px-3 py-2 text-sm">
                {t`This project is closed and now read-only.`}
              </div>
            ) : null}
            <Link
              href={ROUTES.COMPANY.programBProjectDetail(project.id)}
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
        <h1 className="text-foreground text-2xl font-semibold">{t`Company projects`}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {t`Program B delivery tracked for the authenticated organization.`}
        </p>
      </section>

      {projectsContent}
    </div>
  );
}
