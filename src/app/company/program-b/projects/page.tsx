'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import { useProgramBProjectsControllerListMy } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export default function CompanyProgramBProjectsPage() {
  const projectsQuery = useProgramBProjectsControllerListMy();
  const projects = projectsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold text-[#10213d]">{t`Company projects`}</h1>
        <p className="mt-2 text-sm text-[#60718d]">
          {t`Program B delivery tracked for the authenticated organization.`}
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
          >
            <p className="font-semibold text-[#10213d]">
              {normalizeUnknownText(project.backlogItem.title) ?? t`Project`}
            </p>
            <p className="mt-2 text-sm text-[#60718d]">{project.status}</p>
            <p className="mt-1 text-sm text-[#60718d]">{project.team.name}</p>
            <Link
              href={ROUTES.COMPANY.programBProjectDetail(project.id)}
              className="mt-4 inline-flex text-sm font-medium text-[#1e58d5]"
            >
              {t`Open project`}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
