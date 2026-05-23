'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { use } from 'react';

import {
  useProgramBProjectsControllerGetProject,
  useProgramBProjectsControllerListDocuments,
  useProgramBProjectsControllerListMilestones,
  useProgramBProjectsControllerListPoReviews,
} from 'lib/api';
import { ROUTES } from 'lib/constants';
import { formatUnknownDate, normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export default function CompanyProgramBProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectQuery = useProgramBProjectsControllerGetProject(id);
  const milestonesQuery = useProgramBProjectsControllerListMilestones(id);
  const reviewsQuery = useProgramBProjectsControllerListPoReviews(id);
  const documentsQuery = useProgramBProjectsControllerListDocuments(id);
  const project = projectQuery.data;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#10213d]">
              {normalizeUnknownText(project?.backlogItem.title) ?? t`Program B project`}
            </h1>
            <p className="mt-2 text-sm text-[#60718d]">{project?.status}</p>
          </div>
          <Link
            href={ROUTES.COMPANY.PROGRAM_B_PROJECTS}
            className="text-sm font-medium text-[#1e58d5]"
          >
            {t`Back to projects`}
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Overview`}</h2>
          <div className="mt-4 space-y-2 text-sm text-[#60718d]">
            <p>
              {t`Team:`}{' '}
              <span className="font-medium text-[#10213d]">
                {project?.team.name ?? t`Unknown team`}
              </span>
            </p>
            <p>
              {t`Accepted:`}{' '}
              <span className="font-medium text-[#10213d]">
                {project?.acceptedByCompanyAt
                  ? formatUnknownDate(project.acceptedByCompanyAt)
                  : t`Pending`}
              </span>
            </p>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Milestones`}</h2>
          <div className="mt-4 space-y-3">
            {(milestonesQuery.data ?? []).map((milestone) => (
              <div
                key={milestone.id}
                className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4"
              >
                <p className="font-semibold text-[#10213d]">{milestone.title}</p>
                <p className="mt-1 text-sm text-[#60718d]">{milestone.status}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Reviews`}</h2>
          <div className="mt-4 space-y-3">
            {(reviewsQuery.data ?? []).map((review) => (
              <div key={review.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
                <p className="font-semibold text-[#10213d]">{review.decision}</p>
                <p className="mt-1 text-sm text-[#60718d]">
                  {normalizeUnknownText(review.comment) ?? t`No comment`}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Documents`}</h2>
          <div className="mt-4 space-y-3">
            {(documentsQuery.data ?? []).map((document) => (
              <div
                key={document.id}
                className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4"
              >
                <p className="font-semibold text-[#10213d]">{document.name}</p>
                <p className="mt-1 text-sm text-[#60718d]">
                  {document.category} · {document.status}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
