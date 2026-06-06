'use client';

import { useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { ArrowRight, ClipboardCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useAdminApplicationsControllerListProgramAApplications } from 'lib/api/admin/admin';
import { ROUTES } from 'lib/constants';

type ReviewQueueRow = {
  id: string;
  status: string;
  teamName: string;
  callTitle: string;
  submittedAt: string;
  evaluatedByCurrentUser: boolean;
};

type SortOrder = 'newest' | 'oldest';

const OUTLINE_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';
const INPUT_CLASS =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 transition outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toText(value: unknown, fallback = '') {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);

  return fallback;
}

function getNestedValue(source: unknown, keys: string[]) {
  let current: unknown = source;

  for (const key of keys) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }

  return current;
}

function getApplicationsArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];

  const candidates: unknown[] = [data.items, data.data, data.results, data.applications];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function formatDate(value: unknown, fallback = '—') {
  const textValue = toText(value, '');

  if (!textValue) return fallback;

  const date = new Date(textValue);

  if (Number.isNaN(date.getTime())) return textValue;

  return new Intl.DateTimeFormat('sk-SK', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function normalizeReviewRow(row: unknown): ReviewQueueRow | null {
  if (!isRecord(row)) return null;

  const id = toText(row.id, '');

  if (!id) return null;

  return {
    id,
    status: toText(row.status, 'UNKNOWN'),
    teamName: toText(getNestedValue(row, ['team', 'name']), t`Unknown team`),
    callTitle: toText(getNestedValue(row, ['call', 'title']), t`Unknown call`),
    submittedAt: toText(row.submittedAt, toText(row.createdAt, '')),
    evaluatedByCurrentUser:
      getNestedValue(row, ['evaluationSummary', 'evaluatedByCurrentUser']) === true,
  };
}

function getEvaluatingApplications(data: unknown): ReviewQueueRow[] {
  return getApplicationsArray(data)
    .map(normalizeReviewRow)
    .filter((row): row is ReviewQueueRow => row !== null && row.status === 'EVALUATING');
}

function getSubmittedTime(value: string) {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

export default function ReviewDashboardPage() {
  const [callFilter, setCallFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const applicationsQuery = useAdminApplicationsControllerListProgramAApplications<unknown>();

  const applications = useMemo(
    () => getEvaluatingApplications(applicationsQuery.data),
    [applicationsQuery.data],
  );

  const callTitles = useMemo(() => {
    const titles = new Set<string>();

    for (const application of applications) {
      titles.add(application.callTitle);
    }

    return Array.from(titles).sort((first, second) => first.localeCompare(second));
  }, [applications]);

  const visibleApplications = useMemo(() => {
    const filtered = applications.filter(
      (application) => callFilter === 'ALL' || application.callTitle === callFilter,
    );

    return [...filtered].sort((first, second) => {
      const diff = getSubmittedTime(first.submittedAt) - getSubmittedTime(second.submittedAt);

      return sortOrder === 'newest' ? -diff : diff;
    });
  }, [applications, callFilter, sortOrder]);

  const shouldShowEmptyState =
    !applicationsQuery.isLoading && !applicationsQuery.isError && visibleApplications.length === 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 px-6 py-6">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-950">{t`Review queue`}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {t`Applications currently in evaluation. Open an application to score its criteria and record your recommendation.`}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <select
              className={INPUT_CLASS}
              value={callFilter}
              onChange={(event) => setCallFilter(event.target.value)}
            >
              <option value="ALL">{t`All calls`}</option>
              {callTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>

            <select
              className={INPUT_CLASS}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="newest">{t`Newest submissions first`}</option>
              <option value="oldest">{t`Oldest submissions first`}</option>
            </select>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {applicationsQuery.isLoading && (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t`Loading applications to review...`}
              </div>
            </div>
          )}

          {applicationsQuery.isError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {t`Unable to load applications from the backend.`}
            </div>
          )}

          {shouldShowEmptyState && (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {t`No applications to review`}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  {t`There are currently no applications in the evaluation stage.`}
                </p>
              </div>
            </div>
          )}

          {!applicationsQuery.isLoading && visibleApplications.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] tracking-[0.08em] text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t`Team`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Call`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Submitted`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Your evaluation`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Open`}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-slate-950">
                          {application.teamName}
                        </td>
                        <td className="px-4 py-4 text-slate-600">{application.callTitle}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {formatDate(application.submittedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              application.evaluatedByCurrentUser
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {application.evaluatedByCurrentUser
                              ? t`Evaluated`
                              : t`Not yet evaluated`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            className={OUTLINE_BUTTON_CLASS}
                            href={ROUTES.REVIEW.application(application.id)}
                          >
                            {t`Review`}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>{t`Showing applications in the evaluation stage.`}</span>
            <span>
              {t`Rows`}: {visibleApplications.length} / {applications.length}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
