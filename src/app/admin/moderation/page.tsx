'use client';

import { useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { ArrowRight, ClipboardCheck, Search } from 'lucide-react';
import Link from 'next/link';

import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  StatusBadge,
} from 'components/shadcn';
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
      <Card className="overflow-hidden">
        <div className="border-border space-y-4 border-b px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="bg-accent text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <h1 className="text-foreground text-2xl font-bold">{t`Program A Moderation`}</h1>
              <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
                {t`Review Program A applications, move them through moderation, assign mentors, and track delivery milestones.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.value;

              return (
                <Button
                  key={tab.value}
                  className="rounded-full"
                  size="sm"
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setActiveStatus(tab.value)}
                >
                  {getStatusTabLabel(tab.value)}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                className="pl-9"
                placeholder={t`Search by team, call, status, or mentor state...`}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <Input
              placeholder={t`Filter by call`}
              value={callFilter}
              onChange={(event) => setCallFilter(event.target.value)}
            />

            <select
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
            <LoadingState label={t`Loading Program A applications...`} />
          )}

          {applicationsQuery.isError && (
            <ErrorState
              description={t`Unable to load Program A applications from the backend.`}
              title={t`Unable to load applications`}
            />
          )}

          {shouldShowEmptyState && (
            <EmptyState
              description={t`Try changing the search query, call filter, or selected status.`}
              title={t`No Program A applications found`}
            />
          )}

          {!applicationsQuery.isLoading && filteredApplications.length > 0 && (
            <div className="border-border bg-card overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead className="border-border bg-muted text-muted-foreground border-b text-[11px] tracking-[0.08em] uppercase">
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

                  <tbody className="divide-border divide-y">
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-muted/50">
                        <td className="px-4 py-4">
                          <ProgramAStatusBadge status={application.status} />
                        </td>
                        <td className="text-foreground px-4 py-4 font-medium">
                          {application.teamName}
                        </td>
                        <td className="text-muted-foreground px-4 py-4">{application.callTitle}</td>
                        <td className="text-muted-foreground px-4 py-4">
                          {formatDate(application.submittedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge tone={application.mentorAssigned ? 'success' : 'neutral'}>
                            {application.mentorAssigned ? t`Assigned` : t`Not assigned`}
                          </StatusBadge>
                        </td>
                        <td className="text-muted-foreground px-4 py-4">
                          {application.eligibility}
                        </td>
                        <td className="text-foreground px-4 py-4 font-medium">
                          {application.nextAction}
                        </td>
                        <td className="text-muted-foreground px-4 py-4">
                          {formatDate(application.lastActivity)}
                        </td>
                        <td className="px-4 py-4">
                          <Button asChild size="sm" variant="outline">
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

          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>
              {getModerationFooterMessage(applicationsQuery.isError, shouldShowEmptyState)}
            </span>
            <span>
              {t`Rows`}: {filteredApplications.length} / {applications.length}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
