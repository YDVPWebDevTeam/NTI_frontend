'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import {
  useProgramBCompanyOverviewControllerGetBacklogSummary,
  useProgramBCompanyOverviewControllerGetOverview,
  useProgramBCompanyOverviewControllerGetProjectSummary,
} from 'lib/api';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';

export default function CompanyDashboardPage() {
  const overviewQuery = useProgramBCompanyOverviewControllerGetOverview();
  const backlogSummaryQuery = useProgramBCompanyOverviewControllerGetBacklogSummary({
    limit: 3,
  });
  const projectSummaryQuery = useProgramBCompanyOverviewControllerGetProjectSummary({
    limit: 3,
  });

  const overview = overviewQuery.data;
  const backlog = backlogSummaryQuery.data?.items ?? [];
  const projects = projectSummaryQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#1e58d5] uppercase">
          {t`Company workspace`}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#10213d]">
          {t`Program B company dashboard`}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#60718d]">
          {t`Organization metrics, backlog activity, and project delivery now live under the company workspace family.`}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: t`Backlog items`, value: overview?.backlog.total ?? 0 },
          { label: t`Candidates`, value: overview?.candidates.pendingReview ?? 0 },
          { label: t`Projects`, value: overview?.projects.total ?? 0 },
          { label: t`Pending actions`, value: overview?.pendingActions.length ?? 0 },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm text-[#60718d]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#10213d]">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#10213d]">{t`Backlog preview`}</h2>
              <p className="mt-1 text-sm text-[#60718d]">
                {t`Recent organization-scoped Program B backlog items.`}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.COMPANY.PROGRAM_B_BACKLOG}>{t`Open backlog`}</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {backlog.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
                <p className="font-semibold text-[#10213d]">
                  {item.title || t`Untitled backlog item`}
                </p>
                <p className="mt-1 text-sm text-[#60718d]">{item.status}</p>
              </div>
            ))}
            {backlog.length ? null : (
              <p className="text-sm text-[#60718d]">{t`No backlog items available yet.`}</p>
            )}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#10213d]">{t`Project preview`}</h2>
              <p className="mt-1 text-sm text-[#60718d]">
                {t`Current Program B delivery tracked from the company side.`}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.COMPANY.PROGRAM_B_PROJECTS}>{t`Open projects`}</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4"
              >
                <p className="font-semibold text-[#10213d]">{project.title || t`Project`}</p>
                <p className="mt-1 text-sm text-[#60718d]">{project.status}</p>
              </div>
            ))}
            {projects.length ? null : (
              <p className="text-sm text-[#60718d]">{t`No active projects yet.`}</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
