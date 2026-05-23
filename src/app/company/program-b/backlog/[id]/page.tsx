'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { use } from 'react';

import {
  useProgramBBacklogControllerFindPublishedById,
  useProgramBBacklogControllerListCandidates,
  useProgramBBacklogControllerListDocuments,
} from 'lib/api';
import { ROUTES } from 'lib/constants';
import { formatUnknownDate, normalizeUnknownText } from 'lib/student-dashboard/normalizers';

export default function CompanyProgramBBacklogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const itemQuery = useProgramBBacklogControllerFindPublishedById(id);
  const candidatesQuery = useProgramBBacklogControllerListCandidates(id);
  const documentsQuery = useProgramBBacklogControllerListDocuments(id);
  const item = itemQuery.data;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#10213d]">
              {normalizeUnknownText(item?.title) ?? t`Program B backlog item`}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#60718d]">
              {normalizeUnknownText(item?.description) ?? t`No description provided.`}
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

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Overview`}</h2>
          <div className="mt-4 space-y-2 text-sm text-[#60718d]">
            <p>
              {t`Status:`} <span className="font-medium text-[#10213d]">{item?.status}</span>
            </p>
            <p>
              {t`Budget:`}{' '}
              <span className="font-medium text-[#10213d]">
                {normalizeUnknownText(item?.budget) ?? t`Not specified`}
              </span>
            </p>
            <p>
              {t`Updated:`}{' '}
              <span className="font-medium text-[#10213d]">
                {item ? formatUnknownDate(item.updatedAt) : t`Not available`}
              </span>
            </p>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-[#10213d]">{t`Candidates`}</h2>
          <div className="mt-4 space-y-3">
            {(candidatesQuery.data?.data ?? []).map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4"
              >
                <p className="font-semibold text-[#10213d]">{candidate.teamId}</p>
                <p className="mt-1 text-sm text-[#60718d]">{candidate.status}</p>
              </div>
            ))}
            {(candidatesQuery.data?.data ?? []).length ? null : (
              <p className="text-sm text-[#60718d]">{t`No candidates yet.`}</p>
            )}
          </div>
        </article>
      </div>

      <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-semibold text-[#10213d]">{t`Documents`}</h2>
        <div className="mt-4 space-y-3">
          {(documentsQuery.data ?? []).map((document) => (
            <div key={document.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
              <p className="font-semibold text-[#10213d]">{document.name}</p>
              <p className="mt-1 text-sm text-[#60718d]">
                {document.category} · {document.status}
              </p>
            </div>
          ))}
          {(documentsQuery.data ?? []).length ? null : (
            <p className="text-sm text-[#60718d]">{t`No documents uploaded yet.`}</p>
          )}
        </div>
      </article>
    </div>
  );
}
