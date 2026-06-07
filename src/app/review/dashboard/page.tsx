'use client';

import { useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { ArrowRight, ClipboardCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useAdminApplicationsControllerListProgramAApplications } from 'lib/api/admin/admin';
import { StatusBadge } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import {
  formatDate,
  getApplicationsArray,
  getNestedValue,
  isRecord,
  toText,
} from 'lib/review/application-display';

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
  'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50';
const INPUT_CLASS =
  'h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground transition outline-none focus:border-ring focus:ring-4 focus:ring-ring/20';

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
      <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="border-border space-y-4 border-b px-6 py-6">
          <div>
            <div className="bg-accent text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-full">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <h1 className="text-foreground text-2xl font-bold">{t`Review queue`}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
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
            <div className="border-border bg-card flex min-h-72 items-center justify-center rounded-2xl border">
              <div className="text-muted-foreground flex items-center gap-3 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t`Loading applications to review...`}
              </div>
            </div>
          )}

          {applicationsQuery.isError && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm leading-6">
              {t`Unable to load applications from the backend.`}
            </div>
          )}

          {shouldShowEmptyState && (
            <div className="border-border bg-muted flex min-h-72 items-center justify-center rounded-2xl border border-dashed px-6 text-center">
              <div>
                <p className="text-foreground text-lg font-semibold">
                  {t`No applications to review`}
                </p>
                <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                  {t`There are currently no applications in the evaluation stage.`}
                </p>
              </div>
            </div>
          )}

          {!applicationsQuery.isLoading && visibleApplications.length > 0 && (
            <div className="border-border bg-card overflow-hidden rounded-2xl border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-border bg-muted text-muted-foreground border-b text-[11px] tracking-[0.08em] uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t`Team`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Call`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Submitted`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Your evaluation`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Open`}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-border divide-y">
                    {visibleApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-muted/80">
                        <td className="text-foreground px-4 py-4 font-medium">
                          {application.teamName}
                        </td>
                        <td className="text-muted-foreground px-4 py-4">{application.callTitle}</td>
                        <td className="text-muted-foreground px-4 py-4">
                          {formatDate(application.submittedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge
                            tone={application.evaluatedByCurrentUser ? 'success' : 'warning'}
                          >
                            {application.evaluatedByCurrentUser
                              ? t`Evaluated`
                              : t`Not yet evaluated`}
                          </StatusBadge>
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

          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
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
