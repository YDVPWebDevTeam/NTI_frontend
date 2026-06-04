'use client';

import { useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { ArrowRight, ClipboardCheck, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import { useAdminApplicationsControllerListProgramAApplications } from 'lib/api/admin/admin';
import { ROUTES } from 'lib/constants';

type ProgramAApplicationRow = {
  id: string;
  status: string;
  teamName: string;
  callTitle: string;
  submittedAt: string;
  mentorAssigned: boolean;
  eligibility: string;
  nextAction: string;
  lastActivity: string;
};

type StatusTab = {
  label: string;
  value: string;
};

const STATUS_TABS: StatusTab[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Formally Verified', value: 'FORMALLY_VERIFIED' },
  { label: 'Evaluating', value: 'EVALUATING' },
  { label: 'Needs Info', value: 'NEEDS_INFO' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Delivery', value: 'DELIVERY' },
  { label: 'Archived', value: 'ARCHIVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const OUTLINE_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-slate-200 bg-white text-slate-950 hover:bg-slate-50`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toText(value: unknown, fallback = '') {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);

  return fallback;
}

function getNestedValue(source: Record<string, unknown>, keys: string[]) {
  let current: unknown = source;

  for (const key of keys) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }

  return current;
}

function getNestedText(source: Record<string, unknown>, keys: string[], fallback = '') {
  return toText(getNestedValue(source, keys), fallback);
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

function getStatusTabLabel(value: string) {
  switch (value) {
    case 'ALL':
      return t`All`;

    case 'SUBMITTED':
      return t`Submitted`;

    case 'FORMALLY_VERIFIED':
      return t`Formally Verified`;

    case 'EVALUATING':
      return t`Evaluating`;

    case 'NEEDS_INFO':
      return t`Needs Info`;

    case 'APPROVED':
      return t`Approved`;

    case 'DELIVERY':
      return t`Delivery`;

    case 'ARCHIVED':
      return t`Archived`;

    case 'REJECTED':
      return t`Rejected`;

    default:
      return value;
  }
}

function getNextActionLabel(status: string): string {
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
      return t`Assign mentor / onboarding`;

    case 'ONBOARDING':
      return t`Activate project`;

    case 'ACTIVE_PROJECT':
      return t`Track delivery`;

    case 'PAUSED':
      return t`Resume project`;

    case 'COMPLETED':
      return t`Archive application`;

    case 'ARCHIVED':
      return t`No action`;

    case 'REJECTED':
      return t`No action`;

    default:
      return t`No action`;
  }
}

function isDeliveryStatus(status: string) {
  return ['ONBOARDING', 'ACTIVE_PROJECT', 'PAUSED', 'COMPLETED'].includes(status);
}

// NOTE: deliberately does NOT check record.id — any object with an id field
// would be a false-positive. Only real mentor fields and mentor object fields count.
function candidateHasMentor(candidate: unknown): boolean {
  if (typeof candidate === 'string') {
    return candidate.trim().length > 0;
  }

  if (!isRecord(candidate)) {
    return false;
  }

  const record = candidate as unknown as Record<string, unknown>;

  return Boolean(
    toText(record.mentorUserId, '') ||
    toText(record.assignedMentorUserId, '') ||
    toText(record.mentorId, '') ||
    toText(record.assignedMentorId, '') ||
    toText(record.programAMentorId, '') ||
    toText(record.assignedProgramAMentorId, '') ||
    toText(record.email, '') ||
    toText(record.firstName, '') ||
    toText(record.lastName, '') ||
    toText(record.name, ''),
  );
}

function hasMentor(row: Record<string, unknown>) {
  const candidates: unknown[] = [
    row.mentorUserId,
    row.assignedMentorUserId,
    row.mentorId,
    row.assignedMentorId,
    row.programAMentorId,
    row.assignedProgramAMentorId,
    row.mentor,
    row.assignedMentor,
    row.programAMentor,
    getNestedValue(row, ['mentorAssignment', 'mentorUserId']),
    getNestedValue(row, ['assignedMentorAssignment', 'mentorUserId']),
    getNestedValue(row, ['mentorshipAssignment', 'mentorUserId']),
  ];

  return candidates.some(candidateHasMentor);
}

function normalizeProgramAApplication(row: unknown): ProgramAApplicationRow | null {
  if (!isRecord(row)) return null;

  const id = toText(row.id, '');

  if (!id) return null;

  const status = toText(row.status, 'UNKNOWN');

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
    mentorAssigned: hasMentor(row),
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
  return isActive
    ? 'rounded-full border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
    : 'rounded-full border-slate-200 bg-white text-slate-950 hover:bg-slate-50';
}

function matchesSearch(application: ProgramAApplicationRow, searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) return true;

  const searchableText = [
    application.id,
    application.status,
    application.teamName,
    application.callTitle,
    application.mentorAssigned ? 'assigned' : 'not assigned',
    application.eligibility,
    application.nextAction,
    application.lastActivity,
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function matchesStatus(application: ProgramAApplicationRow, activeStatus: string) {
  if (activeStatus === 'ALL') return true;
  if (activeStatus === 'DELIVERY') return isDeliveryStatus(application.status);

  return application.status === activeStatus;
}

function matchesCall(application: ProgramAApplicationRow, callFilter: string) {
  const normalizedCallFilter = callFilter.trim().toLowerCase();

  if (!normalizedCallFilter) return true;

  return application.callTitle.toLowerCase().includes(normalizedCallFilter);
}

function getModerationFooterMessage(isError: boolean, shouldShowEmptyState: boolean): string {
  if (isError) {
    return t`Unable to load live applications.`;
  }

  if (shouldShowEmptyState) {
    return t`No applications found.`;
  }

  return t`Showing Program A moderation rows.`;
}

export default function AdminModerationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [callFilter, setCallFilter] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');

  const applicationsQuery = useAdminApplicationsControllerListProgramAApplications<unknown>();

  const applications: ProgramAApplicationRow[] = useMemo(
    () => getProgramAApplications(applicationsQuery.data),
    [applicationsQuery.data],
  );

  const filteredApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          matchesSearch(application, searchQuery) &&
          matchesCall(application, callFilter) &&
          matchesStatus(application, activeStatus),
      ),
    [activeStatus, applications, callFilter, searchQuery],
  );

  const shouldShowEmptyState =
    !applicationsQuery.isLoading && !applicationsQuery.isError && filteredApplications.length === 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-950">{t`Program A Moderation`}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {t`Review Program A applications, move them through moderation, assign mentors, and track delivery milestones.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.value;

              return (
                <button
                  key={tab.value}
                  className={`${BUTTON_BASE_CLASS} ${getStatusTabClassName(isActive)}`}
                  type="button"
                  onClick={() => setActiveStatus(tab.value)}
                >
                  {getStatusTabLabel(tab.value)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder={t`Search by team, call, status, or mentor state...`}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              placeholder={t`Filter by call`}
              value={callFilter}
              onChange={(event) => setCallFilter(event.target.value)}
            />

            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 transition outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              value={activeStatus}
              onChange={(event) => setActiveStatus(event.target.value)}
            >
              {STATUS_TABS.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {getStatusTabLabel(tab.value)}
                </option>
              ))}
            </select>
          </div>

          {applicationsQuery.isLoading && (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t`Loading Program A applications...`}
              </div>
            </div>
          )}

          {applicationsQuery.isError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {t`Unable to load Program A applications from the backend.`}
            </div>
          )}

          {shouldShowEmptyState && (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {t`No Program A applications found`}
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  {t`Try changing the search query, call filter, or selected status.`}
                </p>
              </div>
            </div>
          )}

          {!applicationsQuery.isLoading && filteredApplications.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] text-left text-sm">
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
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4">
                          <ProgramAStatusBadge status={application.status} />
                        </td>
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
                              application.mentorAssigned
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {application.mentorAssigned ? t`Assigned` : t`Not assigned`}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{application.eligibility}</td>
                        <td className="px-4 py-4 font-medium text-slate-800">
                          {application.nextAction}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {formatDate(application.lastActivity)}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            className={`${OUTLINE_BUTTON_CLASS} bg-white`}
                            href={ROUTES.ADMIN.programAApplicationDetails(application.id)}
                          >
                            {t`View`}
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
            <span>
              {getModerationFooterMessage(applicationsQuery.isError, shouldShowEmptyState)}
            </span>
            <span>
              {t`Rows`}: {filteredApplications.length} / {applications.length}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
