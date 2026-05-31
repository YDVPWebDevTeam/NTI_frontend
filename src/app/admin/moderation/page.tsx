'use client';

import { t } from '@lingui/core/macro';
import { ArrowRight, ClipboardCheck, Filter, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from 'components/shadcn';
import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import { demoProgramAApplications } from 'features/admin-program-a/lib/demo-program-a-data';
import { useAdminApplicationsControllerListProgramAApplications } from 'lib/api/admin/admin';
import { ROUTES } from 'lib/constants';

type ProgramAApplicationRow = {
  id: string;
  status: string;
  teamName: string;
  callTitle: string;
  submittedAt: string;
  mentor: string | null;
  eligibility: string;
  nextAction: string;
  lastActivity: string;
};

const statusTabs = [
  'All',
  'Submitted',
  'Formally Verified',
  'Evaluating',
  'Needs Info',
  'Approved',
  'Delivery',
  'Archived',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function getNestedText(source: Record<string, unknown>, keys: string[], fallback: string) {
  let current: unknown = source;

  for (const key of keys) {
    if (!isRecord(current)) {
      return fallback;
    }

    current = current[key];
  }

  return toText(current, fallback);
}

function getApplicationsArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const candidates = [data.items, data.data, data.results, data.applications];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function getNextActionLabel(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return t`Formal verification`;

    case 'FORMALLY_VERIFIED':
      return t`Start evaluation`;

    case 'EVALUATING':
      return t`Submit evaluation`;

    case 'NEEDS_INFO':
      return t`Waiting for team`;

    case 'APPROVED':
      return t`Assign mentor`;

    case 'ONBOARDING':
      return t`Activate project`;

    case 'ACTIVE_PROJECT':
      return t`Track delivery`;

    case 'PAUSED':
      return t`Resume project`;

    case 'COMPLETED':
      return t`Archive application`;

    default:
      return t`No action`;
  }
}

function normalizeProgramAApplication(row: unknown): ProgramAApplicationRow | null {
  if (!isRecord(row)) {
    return null;
  }

  const id = toText(row.id, '');
  const status = toText(row.status, 'UNKNOWN');

  if (!id) {
    return null;
  }

  return {
    id,
    status,
    teamName:
      toText(row.teamName, '') ||
      getNestedText(row, ['team', 'name'], '') ||
      getNestedText(row, ['applicantTeam', 'name'], t`Unknown team`),
    callTitle:
      toText(row.callTitle, '') ||
      getNestedText(row, ['call', 'title'], '') ||
      getNestedText(row, ['call', 'name'], t`Unknown call`),
    submittedAt: toText(row.submittedAt, toText(row.createdAt, '—')),
    mentor:
      toText(row.mentorName, '') ||
      getNestedText(row, ['mentor', 'name'], '') ||
      getNestedText(row, ['mentor', 'email'], '') ||
      null,
    eligibility:
      toText(row.eligibility, '') ||
      toText(row.eligibilitySummary, '') ||
      toText(row.eligibilitySignalSummary, t`Not checked`),
    nextAction: getNextActionLabel(status),
    lastActivity: toText(row.lastActivityAt, toText(row.updatedAt, '—')),
  };
}

function getProgramAApplications(data: unknown): ProgramAApplicationRow[] {
  return getApplicationsArray(data)
    .map(normalizeProgramAApplication)
    .filter((row): row is ProgramAApplicationRow => row !== null);
}

function getStatusTabClassName(isActive: boolean) {
  if (isActive) {
    return 'rounded-full bg-slate-950 text-white hover:bg-slate-800';
  }

  return 'rounded-full bg-white';
}

function getStatusTabVariant(isActive: boolean) {
  if (isActive) {
    return 'default';
  }

  return 'outline';
}

function getFooterMessage(isError: boolean, shouldShowEmptyState: boolean) {
  if (isError) {
    return t`Unable to load live applications. Showing demo moderation rows.`;
  }

  if (shouldShowEmptyState) {
    return t`No applications found.`;
  }

  return t`Showing Program A moderation rows.`;
}

export default function AdminModerationPage() {
  const applicationsQuery = useAdminApplicationsControllerListProgramAApplications<unknown>();

  const liveApplications = getProgramAApplications(applicationsQuery.data);
  const applications = applicationsQuery.isError ? demoProgramAApplications : liveApplications;
  const shouldShowEmptyState =
    !applicationsQuery.isLoading && !applicationsQuery.isError && applications.length === 0;
  const footerMessage = getFooterMessage(applicationsQuery.isError, shouldShowEmptyState);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <ClipboardCheck className="h-5 w-5" />
              </div>

              <CardTitle className="text-2xl text-slate-950">{t`Program A Moderation`}</CardTitle>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {t`Review submitted Program A applications, request additional information, evaluate teams, and continue approved projects into delivery.`}
              </p>
            </div>

            <Button className="rounded-xl bg-sky-600 text-white hover:bg-sky-500">
              <Filter className="h-4 w-4" />
              {t`Review queue`}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab, index) => {
              const isActive = index === 0;

              return (
                <Button
                  key={tab}
                  type="button"
                  variant={getStatusTabVariant(isActive)}
                  className={getStatusTabClassName(isActive)}
                >
                  {tab}
                </Button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-11 bg-white pl-9"
                placeholder={t`Search by team, applicant, or call...`}
              />
            </div>

            <Input className="h-11 bg-white" placeholder={t`Filter by call`} />
            <Input className="h-11 bg-white" placeholder={t`Filter by status`} />
          </div>

          {applicationsQuery.isLoading && (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t`Loading Program A applications...`}
              </div>
            </div>
          )}

          {shouldShowEmptyState && (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {t`No Program A applications yet`}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  {t`Submitted Program A applications will appear here after teams send their applications for review.`}
                </p>
              </div>
            </div>
          )}

          {!applicationsQuery.isLoading && !shouldShowEmptyState && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] tracking-[0.08em] text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t`Status`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Team`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Call`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Submitted`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Mentor`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Eligibility`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Next action`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Last activity`}</th>
                      <th className="px-4 py-3 font-semibold">{t`Open`}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {applications.map((application) => (
                      <tr key={application.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4">
                          <ProgramAStatusBadge status={application.status} />
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-950">
                          {application.teamName}
                        </td>

                        <td className="px-4 py-4 text-slate-600">{application.callTitle}</td>

                        <td className="px-4 py-4 text-slate-600">{application.submittedAt}</td>

                        <td className="px-4 py-4 text-slate-600">
                          {application.mentor ?? t`Not assigned`}
                        </td>

                        <td className="px-4 py-4 text-slate-600">{application.eligibility}</td>

                        <td className="px-4 py-4 font-medium text-slate-800">
                          {application.nextAction}
                        </td>

                        <td className="px-4 py-4 text-slate-600">{application.lastActivity}</td>

                        <td className="px-4 py-4">
                          <Button asChild variant="outline" size="sm" className="bg-white">
                            <Link href={ROUTES.ADMIN.programAApplicationDetails(application.id)}>
                              {t`View`}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>{footerMessage}</span>
            <span>{t`Page 1 of 1`}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
