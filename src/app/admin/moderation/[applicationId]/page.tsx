'use client';

import { use, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { t } from '@lingui/core/macro';
import { toast } from 'sonner';
import {
  Archive as ArchiveIcon,
  ArrowLeft,
  ClipboardCheck,
  DollarSign,
  FileText,
  Loader2,
  MessageSquareText,
  NotebookPen,
  PlayCircle,
  ShieldCheck,
  Star,
  UserRoundCheck,
  UserRoundPlus,
} from 'lucide-react';
import Link from 'next/link';

import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  ErrorState,
  Input,
  Label,
  LoadingState,
  StatusBadge,
  Textarea,
} from 'components/shadcn';
import {
  getAdminApplicationsControllerListProgramAApplicationsQueryKey,
  useAdminApplicationsControllerActivate,
  useAdminApplicationsControllerApprove,
  useAdminApplicationsControllerArchive,
  useAdminApplicationsControllerComplete,
  useAdminApplicationsControllerCreateProgramAMilestone,
  useAdminApplicationsControllerFormalVerify,
  useAdminApplicationsControllerListProgramAApplications,
  useAdminApplicationsControllerListProgramAMilestones,
  useAdminApplicationsControllerPause,
  useAdminApplicationsControllerReject,
  useAdminApplicationsControllerStartEvaluation,
  useAdminApplicationsControllerStartOnboarding,
  useAdminApplicationsControllerUpdateGrantBudget,
  useAdminApplicationsControllerUpdateProgramAMilestone,
} from 'lib/api/admin/admin';
import { getReportsControllerGetDashboardQueryKey } from 'lib/api/reports/reports';
import { useAdminListUsers } from 'lib/api/admin-users/admin-users';
import { AdminListUsersRole, AdminListUsersStatus } from 'lib/api/index.schemas';
import {
  useApplicationsControllerAssignMentor,
  useApplicationsControllerCreateEvaluation,
  useApplicationsControllerCreateMentorshipNote,
  useApplicationsControllerCreateNeedsInfoItem,
  useApplicationsControllerFindById,
  useApplicationsControllerGetDocumentCompleteness,
  useApplicationsControllerGetEligibilitySignals,
  useApplicationsControllerGetNeedsInfoThread,
  useApplicationsControllerListEvaluations,
  useApplicationsControllerListMentorshipNotes,
  useApplicationsControllerListSections,
} from 'lib/api/applications/applications';
import type {
  ApplicationDetailDto,
  ApplicationEvaluationDto,
  ApplicationLifecycleTransitionDto,
  ApplicationSectionDto,
  CreateApplicationEvaluationDto,
  CreateProgramAMilestoneDto,
  NeedsInfoItemDto,
  OptionalApplicationTransitionNoteDto,
  ProgramAMentorshipNoteDto,
  UpdateApplicationGrantBudgetDto,
  UpdateProgramAMilestoneDto,
} from 'lib/api/index.schemas';
import { ROUTES } from 'lib/constants';
import { clampNumber, isWithinRange, parseNumericInput } from 'lib/validation/numeric';

const SCORE_MIN = 0;
const SCORE_MAX = 100;
const GRANT_BUDGET_MIN = 0;
// Upper bound guards against fat-finger / overflow values being sent to the backend.
const GRANT_BUDGET_MAX = 100_000_000;

type AdminProgramAApplicationDetailPageProps = {
  params: Promise<{ applicationId: string }>;
};

type ApplicationStatus = ApplicationDetailDto['status'];

type EvaluationCriterion = {
  code: 'TECHNICAL_QUALITY' | 'BUSINESS_VALUE' | 'TEAM_CAPABILITY';
  label: string;
};

type ProgramAMilestoneRow = {
  id: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  status: string;
  progressNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type MilestoneDraft = {
  title: string;
  description: string;
  dueAt: string;
  status: NonNullable<CreateProgramAMilestoneDto['status']>;
  progressNote: string;
};

const EVALUATION_CRITERIA: EvaluationCriterion[] = [
  { code: 'TECHNICAL_QUALITY', label: 'Technical quality' },
  { code: 'BUSINESS_VALUE', label: 'Business value' },
  { code: 'TEAM_CAPABILITY', label: 'Team capability' },
];

const MILESTONE_STATUSES = ['PLANNED', 'IN_PROGRESS', 'DONE', 'BLOCKED'] as const;

// Token-based class for the few remaining native <input>/<select> controls,
// mirroring the shared Input/Select primitives so they stay theme-aware.
const INPUT_CLASS =
  'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toText(value: unknown, fallback = '') {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';

  return fallback;
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('sk-SK', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const ISO_DATE_LENGTH = 10;
const JSON_INDENT = 2;

function formatDate(value: unknown, fallback = '—') {
  const textValue = toText(value, '');

  if (!textValue) return fallback;

  const date = new Date(textValue);

  if (Number.isNaN(date.getTime())) return fallback;

  return DATE_TIME_FORMATTER.format(date);
}

function formatDateInputValue(value: unknown) {
  const textValue = toText(value, '');

  if (!textValue) return '';

  const date = new Date(textValue);

  if (Number.isNaN(date.getTime())) return textValue.slice(0, ISO_DATE_LENGTH);

  return date.toISOString().slice(0, ISO_DATE_LENGTH);
}

function getNestedValue(source: unknown, keys: string[]) {
  let current: unknown = source;

  for (const key of keys) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }

  return current;
}

function getReadableText(...values: unknown[]) {
  for (const value of values) {
    const textValue = toText(value, '');

    if (textValue.length > 0 && !isLikelyTechnicalId(textValue)) return textValue;
  }

  return '';
}

function isLikelyTechnicalId(value: string) {
  const normalizedValue = value.trim();

  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedValue) ||
    /^[0-9a-f]{24}$/i.test(normalizedValue)
  );
}

function getApplicationDisplayName(application: unknown, queueRow: unknown) {
  return (
    getReadableText(
      getNestedValue(application, ['name']),
      getNestedValue(application, ['title']),
      getNestedValue(application, ['applicationName']),
      getNestedValue(queueRow, ['name']),
      getNestedValue(queueRow, ['title']),
      getNestedValue(queueRow, ['applicationName']),
      getNestedValue(application, ['profile', 'name']),
      getNestedValue(queueRow, ['profile', 'name']),
    ) || t`Program A application`
  );
}

function getCallDisplayName(application: unknown, queueRow: unknown) {
  return (
    getReadableText(
      getNestedValue(queueRow, ['callTitle']),
      getNestedValue(queueRow, ['call', 'title']),
      getNestedValue(queueRow, ['call', 'name']),
      getNestedValue(application, ['callTitle']),
      getNestedValue(application, ['call', 'title']),
      getNestedValue(application, ['call', 'name']),
    ) || t`Not available`
  );
}

function getTeamDisplayName(application: unknown, queueRow: unknown) {
  return (
    getReadableText(
      getNestedValue(queueRow, ['teamName']),
      getNestedValue(queueRow, ['team', 'name']),
      getNestedValue(queueRow, ['applicantTeam', 'name']),
      getNestedValue(application, ['teamName']),
      getNestedValue(application, ['team', 'name']),
      getNestedValue(application, ['applicantTeam', 'name']),
    ) || t`Not available`
  );
}

function getSubmittedByDisplayName(application: unknown, queueRow: unknown) {
  const firstName = getReadableText(
    getNestedValue(application, ['createdBy', 'firstName']),
    getNestedValue(queueRow, ['createdBy', 'firstName']),
  );
  const lastName = getReadableText(
    getNestedValue(application, ['createdBy', 'lastName']),
    getNestedValue(queueRow, ['createdBy', 'lastName']),
  );
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    getReadableText(
      getNestedValue(application, ['createdBy', 'name']),
      getNestedValue(queueRow, ['createdBy', 'name']),
      getNestedValue(application, ['createdBy', 'email']),
      getNestedValue(queueRow, ['createdBy', 'email']),
    ) ||
    t`Not available`
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.length > 0) return error.message;
  if (isRecord(error)) {
    const message = error.message;

    if (typeof message === 'string' && message.length > 0) return message;
  }

  return t`Something went wrong. Check the Network tab for details.`;
}

function optionalReason(reason: string): OptionalApplicationTransitionNoteDto {
  const trimmed = reason.trim();

  return trimmed.length > 0 ? { reason: trimmed } : {};
}

function requiredReason(reason: string): ApplicationLifecycleTransitionDto {
  return { reason: reason.trim() };
}

function canCreateEvaluation(status: ApplicationStatus | undefined) {
  return status === 'FORMALLY_VERIFIED' || status === 'EVALUATING';
}

function asRecord(value: unknown) {
  return value as Record<string, unknown>;
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

function findApplicationRow(data: unknown, applicationId: string): unknown {
  const rows: unknown[] = getApplicationsArray(data);

  return rows.find((row: unknown): boolean => {
    if (!isRecord(row)) return false;

    return toText(row.id, '') === applicationId;
  });
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

function hasAssignedMentor(value: unknown): boolean {
  if (!isRecord(value)) return false;

  const record = asRecord(value);
  const candidates: unknown[] = [
    record.mentorUserId,
    record.assignedMentorUserId,
    record.mentorId,
    record.assignedMentorId,
    record.programAMentorId,
    record.assignedProgramAMentorId,
    record.mentor,
    record.assignedMentor,
    record.programAMentor,
    record.mentorAssignment,
    record.assignedMentorAssignment,
    record.mentorshipAssignment,
  ];

  return candidates.some(candidateHasMentor);
}

function renderJsonValue(value: unknown) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value, null, JSON_INDENT);
}

function prettySectionTitle(key: string) {
  switch (key) {
    case 'profile':
      return t`Profile`;

    case 'idea_overview':
      return t`Idea overview`;

    default:
      return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

function FieldCard({
  label,
  value,
  className = '',
}: {
  label: string;
  value: unknown;
  className?: string;
}) {
  const textValue = toText(value, '');

  return (
    <div className={`border-border bg-muted rounded-lg border p-4 ${className}`}>
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2 text-sm leading-6 whitespace-pre-wrap">
        {textValue || t`Not provided`}
      </p>
    </div>
  );
}

function SectionValueDisplay({ sectionKey, value }: { sectionKey: string; value: unknown }) {
  const record = isRecord(value) ? asRecord(value) : {};

  if (sectionKey === 'profile') {
    const knownFields = [
      { label: t`Application name`, value: record.name },
      { label: t`Category`, value: record.category },
      { label: t`Team size`, value: record.teamSize },
      {
        label: t`Stack`,
        value: Array.isArray(record.stack) ? record.stack.join(', ') : record.stack,
      },
    ];
    const visibleFields = knownFields.filter((field) => toText(field.value, '').length > 0);

    if (visibleFields.length > 0) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleFields.map((field) => (
            <FieldCard key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      );
    }
  }

  if (sectionKey === 'idea_overview') {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <FieldCard label={t`Problem`} value={record.problem} />
        <FieldCard label={t`Solution`} value={record.solution} />
        <FieldCard label={t`Target users`} value={record.targetUsers} />
        <FieldCard label={t`Value proposition`} value={record.valueProposition} />
      </div>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(asRecord(value));

    if (
      entries.length > 0 &&
      entries.every(([, entryValue]) => !isRecord(entryValue) && !Array.isArray(entryValue))
    ) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {entries.map(([key, entryValue]) => (
            <FieldCard
              key={key}
              label={key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
              value={entryValue}
            />
          ))}
        </div>
      );
    }
  }

  return (
    <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-lg p-4 text-sm leading-6 whitespace-pre-wrap">
      {renderJsonValue(value)}
    </pre>
  );
}

// Compact icon + title row for card headers (shared CardTitle is a styled text node).
function SectionTitle({ children }: { children: ReactNode }) {
  return <CardTitle className="flex items-center gap-2 text-xl">{children}</CardTitle>;
}

// Inline, dashed note used inside cards for small loading / empty hints.
function InlineNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-border bg-muted text-muted-foreground rounded-lg border border-dashed px-4 py-4 text-sm">
      {children}
    </div>
  );
}

// Thin wrapper around the shared Textarea that keeps the (value: string) => void
// onChange contract used across the lifecycle forms on this page.
function FormTextarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Textarea
      className={`min-h-28 resize-y ${className}`}
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function getSectionDescription(sectionKey: string): string {
  if (sectionKey === 'idea_overview') {
    return t`Key business and product information from the submitted application.`;
  }

  if (sectionKey === 'profile') {
    return t`Basic application profile information.`;
  }

  return t`Additional submitted section data.`;
}

function SectionCard({ section }: { section: ApplicationSectionDto }) {
  return (
    <div className="border-border bg-card rounded-lg border p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-foreground text-lg font-bold">{prettySectionTitle(section.key)}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{getSectionDescription(section.key)}</p>
        </div>
        <StatusBadge tone="neutral">v{section.version}</StatusBadge>
      </div>

      <div className="mt-4">
        <SectionValueDisplay sectionKey={section.key} value={section.valueJson} />
      </div>
    </div>
  );
}

function EvaluationCard({ evaluation }: { evaluation: ApplicationEvaluationDto }) {
  const scores = Array.isArray(evaluation.scores) ? evaluation.scores : [];

  return (
    <div className="border-border rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-foreground font-semibold">{t`Evaluator`}</p>
          <p className="text-muted-foreground mt-1 text-sm">{formatDate(evaluation.createdAt)}</p>
        </div>
        <StatusBadge tone="success">
          {evaluation.recommendation ?? t`No recommendation`}
        </StatusBadge>
      </div>

      {toText(evaluation.comment, '').length > 0 && (
        <p className="bg-muted text-muted-foreground mt-3 rounded-md p-3 text-sm leading-6">
          {toText(evaluation.comment)}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {scores.map((score) => (
          <div key={score.id} className="border-border bg-muted rounded-md border p-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
              {score.criterionCode}
            </p>
            <p className="text-foreground mt-1 text-lg font-bold">{score.score}/100</p>
            {toText(score.comment, '').length > 0 && (
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {toText(score.comment)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NeedsInfoCard({ item }: { item: NeedsInfoItemDto }) {
  const replies = Array.isArray(item.replies) ? item.replies : [];

  return (
    <div className="border-border rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-foreground font-semibold">{toText(item.message, '—')}</p>
          <p className="text-muted-foreground mt-1 text-sm">{formatDate(item.createdAt)}</p>
        </div>
        <StatusBadge tone="neutral">{item.status}</StatusBadge>
      </div>

      {replies.length > 0 && (
        <div className="mt-4 space-y-2">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-muted text-muted-foreground rounded-md p-3 text-sm leading-6"
            >
              <p>{reply.message}</p>
              <p className="text-muted-foreground mt-1 text-xs">{formatDate(reply.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MentorshipNoteCard({ note }: { note: ProgramAMentorshipNoteDto }) {
  const authorName = `${note.author.firstName} ${note.author.lastName}`.trim();

  return (
    <div className="border-border rounded-lg border p-4">
      <p className="text-foreground text-sm leading-6">{note.content}</p>
      <p className="text-muted-foreground mt-3 text-xs">
        {authorName.length > 0 ? authorName : note.author.email} · {formatDate(note.createdAt)}
      </p>
    </div>
  );
}

export default function AdminProgramAApplicationDetailPage({
  params,
}: AdminProgramAApplicationDetailPageProps) {
  const { applicationId } = use(params);

  const queryClient = useQueryClient();

  const [transitionReason, setTransitionReason] = useState('');
  const [grantBudgetInput, setGrantBudgetInput] = useState('');
  const [mentorUserId, setMentorUserId] = useState('');
  const [needsInfoMessage, setNeedsInfoMessage] = useState('');
  const [needsInfoDueAt, setNeedsInfoDueAt] = useState('');
  const [mentorshipNote, setMentorshipNote] = useState('');
  const [evaluationRecommendation, setEvaluationRecommendation] = useState('APPROVE');
  const [evaluationComment, setEvaluationComment] = useState('');
  const [evaluationScores, setEvaluationScores] = useState<
    Record<EvaluationCriterion['code'], number>
  >({
    TECHNICAL_QUALITY: 80,
    BUSINESS_VALUE: 80,
    TEAM_CAPABILITY: 80,
  });
  const [milestoneDraft, setMilestoneDraft] = useState<MilestoneDraft>({
    title: '',
    description: '',
    dueAt: '',
    status: 'PLANNED',
    progressNote: '',
  });
  const [milestoneProgressDrafts, setMilestoneProgressDrafts] = useState<Record<string, string>>(
    {},
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const showActionError = (message: string) => {
    setActionError(message);
    toast.error(message);
  };

  // Which lifecycle transition currently has its confirmation dialog open.
  const [confirmAction, setConfirmAction] = useState<
    'approve' | 'reject' | 'startOnboarding' | 'activate' | 'pause' | 'complete' | 'archive' | null
  >(null);
  const closeConfirm = () => setConfirmAction(null);

  // Queue query — used as the authoritative source for mentor assignment state,
  // because ApplicationDetailDto does not include mentor fields.
  const programAApplicationsQuery = useAdminApplicationsControllerListProgramAApplications();

  // Assignable mentors for the mentor dropdown. There is no Program A-specific
  // "assignable mentors" endpoint, but the admin users list supports a role filter,
  // so we list active MENTOR-role users instead of relying on a free-text user id.
  const assignableMentorsQuery = useAdminListUsers(
    {
      role: AdminListUsersRole.MENTOR,
      status: AdminListUsersStatus.ACTIVE,
      limit: 100,
    },
    { query: { enabled: applicationId.length > 0 } },
  );
  const assignableMentors = assignableMentorsQuery.data?.data ?? [];

  const applicationQuery = useApplicationsControllerFindById<ApplicationDetailDto>(applicationId, {
    query: { enabled: applicationId.length > 0 },
  });
  const sectionsQuery = useApplicationsControllerListSections<ApplicationSectionDto[]>(
    applicationId,
    {
      query: { enabled: applicationId.length > 0 },
    },
  );
  const documentCompletenessQuery = useApplicationsControllerGetDocumentCompleteness<unknown>(
    applicationId,
    { query: { enabled: applicationId.length > 0 } },
  );
  const eligibilitySignalsQuery = useApplicationsControllerGetEligibilitySignals<unknown>(
    applicationId,
    { query: { enabled: applicationId.length > 0 } },
  );
  const evaluationsQuery = useApplicationsControllerListEvaluations<ApplicationEvaluationDto[]>(
    applicationId,
    { query: { enabled: applicationId.length > 0 } },
  );
  const needsInfoQuery = useApplicationsControllerGetNeedsInfoThread<unknown>(applicationId, {
    query: { enabled: applicationId.length > 0 },
  });
  const mentorshipNotesQuery = useApplicationsControllerListMentorshipNotes<
    ProgramAMentorshipNoteDto[]
  >(applicationId, { query: { enabled: applicationId.length > 0 } });
  const milestonesQuery = useAdminApplicationsControllerListProgramAMilestones<
    ProgramAMilestoneRow[]
  >(applicationId, { query: { enabled: applicationId.length > 0 } });

  const refetchApplicationData = () => {
    setActionError(null);
    void applicationQuery.refetch();
    void documentCompletenessQuery.refetch();
    void eligibilitySignalsQuery.refetch();
  };

  const refetchReviewData = () => {
    void evaluationsQuery.refetch();
    void needsInfoQuery.refetch();
  };

  const refetchMentorshipData = () => {
    void mentorshipNotesQuery.refetch();
    void milestonesQuery.refetch();
  };

  // Invalidate the shared queries that other admin views read from, so navigating
  // back to the moderation list / overview reflects the new lifecycle status instead
  // of stale data. The detail page only holds its own query instances; without this,
  // the list query key and the dashboard counts would never update after a transition.
  const invalidateSharedApplicationQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: getAdminApplicationsControllerListProgramAApplicationsQueryKey(),
    });
    void queryClient.invalidateQueries({
      queryKey: getReportsControllerGetDashboardQueryKey(),
    });
  };

  const refetchAllData = () => {
    refetchApplicationData();
    void sectionsQuery.refetch();
    refetchReviewData();
    refetchMentorshipData();
    invalidateSharedApplicationQueries();
  };

  const mutationOptions = {
    onSuccess: () => {
      setActionError(null);
      refetchAllData();
    },
    onError: (error: unknown) => showActionError(getErrorMessage(error)),
  };

  const formalVerifyMutation = useAdminApplicationsControllerFormalVerify({
    mutation: mutationOptions,
  });
  const startEvaluationMutation = useAdminApplicationsControllerStartEvaluation({
    mutation: mutationOptions,
  });
  const approveMutation = useAdminApplicationsControllerApprove({ mutation: mutationOptions });
  const rejectMutation = useAdminApplicationsControllerReject({ mutation: mutationOptions });
  const startOnboardingMutation = useAdminApplicationsControllerStartOnboarding({
    mutation: mutationOptions,
  });
  const activateMutation = useAdminApplicationsControllerActivate({ mutation: mutationOptions });
  const pauseMutation = useAdminApplicationsControllerPause({ mutation: mutationOptions });
  const completeMutation = useAdminApplicationsControllerComplete({ mutation: mutationOptions });
  const archiveMutation = useAdminApplicationsControllerArchive({ mutation: mutationOptions });
  const updateGrantBudgetMutation = useAdminApplicationsControllerUpdateGrantBudget({
    mutation: {
      onSuccess: () => {
        setGrantBudgetInput('');
        refetchApplicationData();
      },
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });

  const assignMentorMutation = useApplicationsControllerAssignMentor({
    mutation: {
      onSuccess: () => {
        setMentorUserId('');
        void applicationQuery.refetch();
        // Refetch the queue so mentorAssigned state reflects the new assignment
        void programAApplicationsQuery.refetch();
        void mentorshipNotesQuery.refetch();
        void milestonesQuery.refetch();
      },
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });
  const createMentorshipNoteMutation = useApplicationsControllerCreateMentorshipNote({
    mutation: {
      onSuccess: () => {
        setMentorshipNote('');
        refetchMentorshipData();
      },
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });
  const createNeedsInfoMutation = useApplicationsControllerCreateNeedsInfoItem({
    mutation: {
      onSuccess: () => {
        setNeedsInfoMessage('');
        setNeedsInfoDueAt('');
        refetchApplicationData();
        refetchReviewData();
      },
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });
  const createEvaluationMutation = useApplicationsControllerCreateEvaluation({
    mutation: {
      onSuccess: () => {
        setEvaluationComment('');
        refetchApplicationData();
        refetchReviewData();
      },
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });
  const createMilestoneMutation = useAdminApplicationsControllerCreateProgramAMilestone({
    mutation: {
      onSuccess: () => {
        setMilestoneDraft({
          title: '',
          description: '',
          dueAt: '',
          status: 'PLANNED',
          progressNote: '',
        });
        refetchMentorshipData();
      },
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });
  const updateMilestoneMutation = useAdminApplicationsControllerUpdateProgramAMilestone({
    mutation: {
      onSuccess: refetchMentorshipData,
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });

  const application = applicationQuery.data;
  const status = application?.status;
  const hasApplication = Boolean(application);

  // Mentor assignment state: prefer the queue row (which contains mentor fields
  // not present in ApplicationDetailDto), then fall back to the detail object.
  const applicationQueueRow = findApplicationRow(programAApplicationsQuery.data, applicationId);
  const mentorAssigned = hasAssignedMentor(applicationQueueRow) || hasAssignedMentor(application);

  const hasTransitionReason = transitionReason.trim().length > 0;
  const hasMentorUserId = mentorUserId.trim().length > 0;
  const hasMentorshipNote = mentorshipNote.trim().length > 0;
  const hasNeedsInfoMessage = needsInfoMessage.trim().length > 0;
  const hasMilestoneTitle = milestoneDraft.title.trim().length > 0;

  const isAnyMutationPending =
    formalVerifyMutation.isPending ||
    startEvaluationMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    startOnboardingMutation.isPending ||
    activateMutation.isPending ||
    pauseMutation.isPending ||
    completeMutation.isPending ||
    archiveMutation.isPending ||
    updateGrantBudgetMutation.isPending ||
    assignMentorMutation.isPending ||
    createMentorshipNoteMutation.isPending ||
    createNeedsInfoMutation.isPending ||
    createEvaluationMutation.isPending ||
    createMilestoneMutation.isPending ||
    updateMilestoneMutation.isPending;

  const canRunAction = hasApplication && !applicationQuery.isLoading && !isAnyMutationPending;
  const canUseMentorshipNotes = canRunAction && mentorAssigned;

  const applicationStatus = status;

  const canFormalVerify = applicationStatus === 'SUBMITTED';
  const canStartEvaluation = applicationStatus === 'FORMALLY_VERIFIED';
  const canApprove = applicationStatus === 'EVALUATING';
  const canReject = ['SUBMITTED', 'FORMALLY_VERIFIED', 'EVALUATING', 'NEEDS_INFO'].includes(
    applicationStatus ?? '',
  );
  const canStartOnboarding = applicationStatus === 'APPROVED';
  const canActivateProject = ['ONBOARDING', 'PAUSED'].includes(applicationStatus ?? '');
  const canPauseProject = applicationStatus === 'ACTIVE_PROJECT';
  const canCompleteProject = applicationStatus === 'ACTIVE_PROJECT';
  const canArchive = ['REJECTED', 'COMPLETED'].includes(applicationStatus ?? '');
  const canSetGrantBudget = ['APPROVED', 'ONBOARDING', 'ACTIVE_PROJECT', 'PAUSED'].includes(
    applicationStatus ?? '',
  );

  const sections: ApplicationSectionDto[] = Array.isArray(sectionsQuery.data)
    ? sectionsQuery.data
    : [];
  const evaluations: ApplicationEvaluationDto[] = Array.isArray(evaluationsQuery.data)
    ? evaluationsQuery.data
    : [];
  const mentorshipNotes: ProgramAMentorshipNoteDto[] = Array.isArray(mentorshipNotesQuery.data)
    ? mentorshipNotesQuery.data
    : [];
  const milestones: ProgramAMilestoneRow[] = Array.isArray(milestonesQuery.data)
    ? milestonesQuery.data
    : [];

  const needsInfoItems: NeedsInfoItemDto[] = useMemo(() => {
    const data = needsInfoQuery.data;

    if (!isRecord(data)) return [];

    return Array.isArray(data.items) ? (data.items as NeedsInfoItemDto[]) : [];
  }, [needsInfoQuery.data]);

  const completenessSummary = useMemo(() => {
    const data = documentCompletenessQuery.data;

    if (!isRecord(data)) return t`Not checked`;
    const isComplete = data.isComplete === true;
    const missing = Array.isArray(data.missingDocuments) ? data.missingDocuments.length : 0;

    return isComplete ? t`Complete` : `${t`Missing documents`}: ${missing}`;
  }, [documentCompletenessQuery.data]);

  const eligibilitySummary = useMemo(() => {
    const data = eligibilitySignalsQuery.data;

    if (!isRecord(data) || !Array.isArray(data.signals)) return t`Not checked`;
    const failed = data.signals.filter(
      (signal) => isRecord(signal) && signal.passed === false,
    ).length;

    return failed === 0 ? t`All signals passed` : `${t`Failed signals`}: ${failed}`;
  }, [eligibilitySignalsQuery.data]);

  const applicationTitle = getApplicationDisplayName(application, applicationQueueRow);
  const currentGrantBudget = application?.grantBudget as unknown;
  const grantBudgetDisplay =
    typeof currentGrantBudget === 'number' ? `€${currentGrantBudget.toLocaleString()}` : t`Not set`;

  const applicationInfoRows: { label: string; value: unknown }[] = [
    { label: t`Application`, value: applicationTitle },
    { label: t`Call`, value: getCallDisplayName(application, applicationQueueRow) },
    { label: t`Team`, value: getTeamDisplayName(application, applicationQueueRow) },
    { label: t`Submitted by`, value: getSubmittedByDisplayName(application, applicationQueueRow) },
    { label: t`Submitted`, value: formatDate(application?.submittedAt) },
    { label: t`Last updated`, value: formatDate(application?.updatedAt) },
    { label: t`Documents`, value: completenessSummary },
    { label: t`Eligibility`, value: eligibilitySummary },
    { label: t`Grant budget`, value: grantBudgetDisplay },
  ];

  const validateBaseAction = () => {
    if (!hasApplication) {
      showActionError(t`Application data is not loaded yet.`);

      return false;
    }

    if (applicationQuery.isLoading || isAnyMutationPending) {
      showActionError(t`Please wait until the current request finishes.`);

      return false;
    }

    return true;
  };

  const validateTransition = (isAllowed: boolean, message: string, requiresReason = false) => {
    if (!validateBaseAction()) return false;

    if (!isAllowed) {
      showActionError(message);

      return false;
    }

    if (requiresReason && !hasTransitionReason) {
      showActionError(t`Please write a transition reason before running this action.`);

      return false;
    }

    return true;
  };

  const runFormalVerify = () => {
    if (
      !validateTransition(
        canFormalVerify,
        t`Formal verification is only available for submitted applications.`,
      )
    ) {
      return;
    }

    formalVerifyMutation.mutate({ id: applicationId, data: optionalReason(transitionReason) });
  };

  const runStartEvaluation = () => {
    if (
      !validateTransition(
        canStartEvaluation,
        t`Evaluation can only be started after formal verification.`,
      )
    ) {
      return;
    }

    startEvaluationMutation.mutate({ id: applicationId, data: optionalReason(transitionReason) });
  };

  const runApprove = () => {
    if (
      !validateTransition(
        canApprove,
        t`Approval is only available while the application is evaluating.`,
      )
    ) {
      return;
    }

    approveMutation.mutate({ id: applicationId, data: optionalReason(transitionReason) });
  };

  const runReject = () => {
    if (
      !validateTransition(
        canReject,
        t`Reject is only available during submitted, formal verification, evaluation, or needs-info states.`,
        true,
      )
    ) {
      return;
    }

    rejectMutation.mutate({ id: applicationId, data: requiredReason(transitionReason) });
  };

  const runStartOnboarding = () => {
    if (
      !validateTransition(
        canStartOnboarding,
        t`Onboarding can only be started after the application is approved.`,
      )
    ) {
      return;
    }

    startOnboardingMutation.mutate({ id: applicationId });
  };

  const runActivate = () => {
    if (
      !validateTransition(
        canActivateProject,
        t`Project activation is only available from onboarding or paused states.`,
      )
    ) {
      return;
    }

    activateMutation.mutate({ id: applicationId });
  };

  const runPause = () => {
    if (
      !validateTransition(
        canPauseProject,
        t`Project pause is only available for active projects.`,
        true,
      )
    ) {
      return;
    }

    pauseMutation.mutate({ id: applicationId, data: requiredReason(transitionReason) });
  };

  const runComplete = () => {
    if (
      !validateTransition(
        canCompleteProject,
        t`Project completion is only available for active projects.`,
      )
    ) {
      return;
    }

    completeMutation.mutate({ id: applicationId });
  };

  const runArchive = () => {
    if (
      !validateTransition(
        canArchive,
        t`Archive is only available for rejected or completed applications.`,
        true,
      )
    ) {
      return;
    }

    archiveMutation.mutate({ id: applicationId, data: requiredReason(transitionReason) });
  };

  const runAssignMentor = () => {
    if (!validateBaseAction()) return;

    if (!hasMentorUserId) {
      showActionError(t`Select a mentor before assigning one.`);

      return;
    }

    assignMentorMutation.mutate({
      id: applicationId,
      data: { mentorUserId: mentorUserId.trim() },
    });
  };

  const runCreateNeedsInfo = () => {
    if (!validateBaseAction()) return;

    if (!hasNeedsInfoMessage) {
      showActionError(t`Write what information is needed before creating a needs-info item.`);

      return;
    }

    createNeedsInfoMutation.mutate({
      id: applicationId,
      data: {
        message: needsInfoMessage.trim(),
        dueAt: needsInfoDueAt ? new Date(`${needsInfoDueAt}T23:59:59`).toISOString() : undefined,
      },
    });
  };

  const runCreateMentorshipNote = () => {
    if (!validateBaseAction()) return;

    if (!mentorAssigned) {
      showActionError(t`Assign a mentor before adding mentorship notes.`);

      return;
    }

    if (!hasMentorshipNote) {
      showActionError(t`Write a mentorship note before saving it.`);

      return;
    }

    createMentorshipNoteMutation.mutate({
      id: applicationId,
      data: { content: mentorshipNote.trim() },
    });
  };

  const runCreateEvaluation = () => {
    if (!validateBaseAction()) return;

    if (!canCreateEvaluation(status)) {
      showActionError(
        t`Evaluation can only be created after formal verification or during evaluation.`,
      );

      return;
    }

    const invalidCriterion = EVALUATION_CRITERIA.find(
      (criterion) => !isWithinRange(evaluationScores[criterion.code], SCORE_MIN, SCORE_MAX),
    );

    if (invalidCriterion) {
      showActionError(
        t`Each score must be a number between ${SCORE_MIN} and ${SCORE_MAX}. Check "${invalidCriterion.label}".`,
      );

      return;
    }

    const data: CreateApplicationEvaluationDto = {
      recommendation: evaluationRecommendation,
      comment: evaluationComment.trim().length > 0 ? evaluationComment.trim() : undefined,
      scores: EVALUATION_CRITERIA.map((criterion) => ({
        criterionCode: criterion.code,
        score: evaluationScores[criterion.code],
      })),
    };

    createEvaluationMutation.mutate({ id: applicationId, data });
  };

  const runCreateMilestone = () => {
    if (!validateBaseAction()) return;

    if (!hasMilestoneTitle) {
      showActionError(t`Enter a milestone title before creating it.`);

      return;
    }

    const data: CreateProgramAMilestoneDto = {
      title: milestoneDraft.title.trim(),
      description: milestoneDraft.description.trim() || undefined,
      dueAt: milestoneDraft.dueAt
        ? new Date(`${milestoneDraft.dueAt}T12:00:00`).toISOString()
        : undefined,
      status: milestoneDraft.status,
      progressNote: milestoneDraft.progressNote.trim() || undefined,
    };

    createMilestoneMutation.mutate({ id: applicationId, data });
  };
  const runUpdateMilestone = (
    milestone: ProgramAMilestoneRow,
    data: UpdateProgramAMilestoneDto,
  ) => {
    if (!validateBaseAction()) return;

    updateMilestoneMutation.mutate({ id: applicationId, milestoneId: milestone.id, data });
  };

  const runUpdateGrantBudget = () => {
    if (!validateBaseAction()) return;

    if (!canSetGrantBudget) {
      showActionError(t`Grant budget can only be set after the application is approved.`);

      return;
    }

    const parsed = parseNumericInput(grantBudgetInput);

    if (parsed === null || !isWithinRange(parsed, GRANT_BUDGET_MIN, GRANT_BUDGET_MAX)) {
      showActionError(
        t`Enter a grant budget between ${GRANT_BUDGET_MIN} and ${GRANT_BUDGET_MAX} EUR.`,
      );

      return;
    }

    // The generated client types grantBudget as a loose object, but the backend
    // expects a numeric EUR amount; this cast is required to honour the real contract.
    const data: UpdateApplicationGrantBudgetDto = {
      grantBudget: parsed as unknown as UpdateApplicationGrantBudgetDto['grantBudget'],
    };

    updateGrantBudgetMutation.mutate({ id: applicationId, data });
  };

  if (applicationQuery.isLoading) {
    return <LoadingState label={t`Loading application detail...`} />;
  }

  return (
    <div className="space-y-6">
      <Button asChild className="w-fit" variant="outline">
        <Link href={ROUTES.ADMIN.PROGRAM_A_MODERATION}>
          <ArrowLeft className="h-4 w-4" />
          {t`Back to review queue`}
        </Link>
      </Button>

      {(applicationQuery.isError || actionError) && (
        <ErrorState
          description={actionError ?? t`Unable to load application detail from the backend.`}
          title={t`Action failed`}
        />
      )}

      <Card>
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="bg-accent text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-foreground text-3xl font-bold">{applicationTitle}</h1>
                {status && <ProgramAStatusBadge status={status} />}
              </div>
              <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
                {t`Review metadata, evaluate the application, request information, assign a mentor, and manage Program A delivery milestones.`}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {applicationInfoRows.map((row) => (
              <div key={row.label} className="border-border bg-muted rounded-lg border p-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                  {row.label}
                </p>
                <p className="text-foreground mt-2 font-semibold break-words">
                  {toText(row.value, '—')}
                </p>
              </div>
            ))}
            <div className="border-border bg-muted rounded-lg border p-4 md:col-span-2 xl:col-span-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                {t`Decision reason`}
              </p>
              <p className="text-foreground mt-2 text-sm leading-6">
                {toText(application?.decisionRationale, '—')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.45fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <SectionTitle>
                <FileText className="text-primary h-5 w-5" />
                {t`Application sections`}
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionsQuery.isLoading && (
                <InlineNote>{t`Loading application sections...`}</InlineNote>
              )}
              {!sectionsQuery.isLoading && sections.length === 0 && (
                <InlineNote>{t`No application sections were returned by the backend.`}</InlineNote>
              )}
              {sections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle>
                <Star className="text-primary h-5 w-5" />
                {t`Evaluations`}
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluationsQuery.isLoading && <InlineNote>{t`Loading evaluations...`}</InlineNote>}
              {!evaluationsQuery.isLoading && evaluations.length === 0 && (
                <InlineNote>{t`No evaluations were returned by the backend.`}</InlineNote>
              )}
              {evaluations.map((evaluation) => (
                <EvaluationCard key={evaluation.id} evaluation={evaluation} />
              ))}

              <div className="border-border bg-muted rounded-lg border p-4">
                <p className="text-foreground font-semibold">{t`Add evaluation`}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {t`Create criterion-based scoring after formal verification or during evaluation.`}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {EVALUATION_CRITERIA.map((criterion) => (
                    <label key={criterion.code} className="block">
                      <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                        {criterion.label}
                      </span>
                      <input
                        className={`${INPUT_CLASS} mt-2 font-semibold`}
                        max={SCORE_MAX}
                        min={SCORE_MIN}
                        type="number"
                        value={evaluationScores[criterion.code]}
                        onChange={(event) => {
                          const parsed = parseNumericInput(event.target.value);

                          // Ignore non-numeric / empty input so we never store NaN.
                          if (parsed === null) {
                            return;
                          }

                          setEvaluationScores((currentScores) => ({
                            ...currentScores,
                            [criterion.code]: clampNumber(parsed, SCORE_MIN, SCORE_MAX),
                          }));
                        }}
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                  <label className="block">
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                      {t`Recommendation`}
                    </span>
                    <select
                      className={`${INPUT_CLASS} mt-2 font-semibold`}
                      value={evaluationRecommendation}
                      onChange={(event) => setEvaluationRecommendation(event.target.value)}
                    >
                      <option value="APPROVE">{t`Approve`}</option>
                      <option value="NEEDS_INFO">{t`Needs info`}</option>
                      <option value="REJECT">{t`Reject`}</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                      {t`Comment`}
                    </span>
                    <input
                      className={`${INPUT_CLASS} mt-2`}
                      value={evaluationComment}
                      onChange={(event) => setEvaluationComment(event.target.value)}
                    />
                  </label>
                </div>

                <Button
                  className="mt-4"
                  disabled={!canRunAction || !canCreateEvaluation(status)}
                  type="button"
                  onClick={runCreateEvaluation}
                >
                  {createEvaluationMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t`Save evaluation`}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle>
                <MessageSquareText className="text-primary h-5 w-5" />
                {t`Needs-info thread`}
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {needsInfoQuery.isLoading && (
                <InlineNote>{t`Loading needs-info thread...`}</InlineNote>
              )}
              {!needsInfoQuery.isLoading && needsInfoItems.length === 0 && (
                <InlineNote>{t`No needs-info messages were returned by the backend.`}</InlineNote>
              )}
              {needsInfoItems.map((item) => (
                <NeedsInfoCard key={item.id} item={item} />
              ))}

              <div className="border-border bg-muted rounded-lg border p-4">
                <p className="text-foreground font-semibold">{t`Request additional information`}</p>
                <FormTextarea
                  disabled={!canRunAction}
                  placeholder={t`Explain what the team has to clarify or upload...`}
                  value={needsInfoMessage}
                  onChange={setNeedsInfoMessage}
                />
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">
                  <label className="block md:w-56">
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                      {t`Due date`}
                    </span>
                    <Input
                      className="mt-2"
                      disabled={!canRunAction}
                      type="date"
                      value={needsInfoDueAt}
                      onChange={(event) => setNeedsInfoDueAt(event.target.value)}
                    />
                  </label>
                  <Button
                    disabled={!canRunAction || !hasNeedsInfoMessage}
                    type="button"
                    variant="outline"
                    onClick={runCreateNeedsInfo}
                  >
                    {createNeedsInfoMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {t`Create needs-info item`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle>
                <NotebookPen className="text-primary h-5 w-5" />
                {t`Mentorship notes`}
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-border bg-muted rounded-lg border p-4">
                <p className="text-foreground font-semibold">{t`Mentor assignment`}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {t`Assign or update the Program A mentor responsible for delivery follow-up.`}
                </p>
                <div className="border-border bg-background text-muted-foreground mt-3 rounded-md border px-3 py-2 text-sm">
                  <span className="text-foreground font-semibold">{t`Current mentor`}:</span>{' '}
                  {mentorAssigned ? t`Assigned` : t`Not assigned`}
                </div>
                <div className="mt-3 flex flex-col gap-3 md:flex-row">
                  <select
                    className={`${INPUT_CLASS} min-w-0 flex-1`}
                    disabled={!canRunAction || assignableMentorsQuery.isLoading}
                    value={mentorUserId}
                    onChange={(event) => setMentorUserId(event.target.value)}
                  >
                    <option value="">
                      {assignableMentorsQuery.isLoading
                        ? t`Loading mentors...`
                        : t`Select a mentor`}
                    </option>
                    {assignableMentors.map((mentor) => {
                      const mentorName = `${mentor.firstName} ${mentor.lastName}`.trim();

                      return (
                        <option key={mentor.id} value={mentor.id}>
                          {mentorName.length > 0 ? `${mentorName} (${mentor.email})` : mentor.email}
                        </option>
                      );
                    })}
                  </select>
                  {/* TODO: replace this list with a searchable mentor picker once a
                      dedicated "assignable mentors" search endpoint exists. */}
                  <Button
                    disabled={!canRunAction || !hasMentorUserId}
                    type="button"
                    variant="outline"
                    onClick={runAssignMentor}
                  >
                    {assignMentorMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <UserRoundPlus className="h-4 w-4" />
                    {mentorAssigned ? t`Reassign mentor` : t`Assign mentor`}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2 text-xs leading-5">
                  {t`Pick an active MENTOR-role user. The selected user becomes responsible for delivery follow-up.`}
                </p>
                {!assignableMentorsQuery.isLoading && assignableMentors.length === 0 ? (
                  <p className="text-muted-foreground mt-2 text-xs leading-5">
                    {t`No active mentor-role users were found. Create or activate a user with the MENTOR role to assign one.`}
                  </p>
                ) : null}
              </div>

              {mentorshipNotesQuery.isLoading && (
                <InlineNote>{t`Loading mentorship notes...`}</InlineNote>
              )}
              {!mentorshipNotesQuery.isLoading && mentorshipNotes.length === 0 && (
                <InlineNote>{t`No mentorship notes were returned by the backend.`}</InlineNote>
              )}
              {mentorshipNotes.map((note) => (
                <MentorshipNoteCard key={note.id} note={note} />
              ))}

              <FormTextarea
                disabled={!canUseMentorshipNotes}
                placeholder={
                  mentorAssigned
                    ? t`Write a mentorship note...`
                    : t`Assign a mentor before adding mentorship notes.`
                }
                value={mentorshipNote}
                onChange={setMentorshipNote}
              />
              <Button
                disabled={!canUseMentorshipNotes || !hasMentorshipNote}
                type="button"
                variant="outline"
                onClick={runCreateMentorshipNote}
              >
                {createMentorshipNoteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t`Add note`}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle>
                <NotebookPen className="text-primary h-5 w-5" />
                {t`Program A milestones`}
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestonesQuery.isLoading && (
                <InlineNote>{t`Loading Program A milestones...`}</InlineNote>
              )}
              {!milestonesQuery.isLoading && milestones.length === 0 && (
                <InlineNote>{t`No Program A milestones were returned by the backend.`}</InlineNote>
              )}

              {milestones.map((milestone) => {
                const progressDraft =
                  milestoneProgressDrafts[milestone.id] ?? toText(milestone.progressNote, '');

                return (
                  <div key={milestone.id} className="border-border rounded-lg border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-foreground font-semibold">{milestone.title}</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {t`Due`}: {formatDate(milestone.dueAt)}
                        </p>
                      </div>
                      <select
                        className={`${INPUT_CLASS} h-auto w-auto py-2 text-xs font-semibold`}
                        disabled={!canRunAction}
                        value={milestone.status}
                        onChange={(event) =>
                          runUpdateMilestone(milestone, {
                            status: event.target.value as UpdateProgramAMilestoneDto['status'],
                          })
                        }
                      >
                        {MILESTONE_STATUSES.map((milestoneStatus) => (
                          <option key={milestoneStatus} value={milestoneStatus}>
                            {milestoneStatus}
                          </option>
                        ))}
                      </select>
                    </div>

                    {toText(milestone.description, '').length > 0 && (
                      <p className="text-muted-foreground mt-3 text-sm leading-6">
                        {milestone.description}
                      </p>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <label className="block">
                        <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                          {t`Progress note`}
                        </span>
                        <Input
                          className="mt-2"
                          disabled={!canRunAction}
                          value={progressDraft}
                          onChange={(event) =>
                            setMilestoneProgressDrafts((currentDrafts) => ({
                              ...currentDrafts,
                              [milestone.id]: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <Button
                        disabled={!canRunAction}
                        type="button"
                        variant="outline"
                        onClick={() =>
                          runUpdateMilestone(milestone, {
                            progressNote: progressDraft.trim() || undefined,
                          })
                        }
                      >
                        {t`Save progress`}
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="border-border bg-muted rounded-lg border p-4">
                <p className="text-foreground font-semibold">{t`Create milestone`}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    className={INPUT_CLASS}
                    disabled={!canRunAction}
                    placeholder={t`Milestone title`}
                    value={milestoneDraft.title}
                    onChange={(event) =>
                      setMilestoneDraft((draft) => ({ ...draft, title: event.target.value }))
                    }
                  />
                  <input
                    className={INPUT_CLASS}
                    disabled={!canRunAction}
                    type="date"
                    value={formatDateInputValue(milestoneDraft.dueAt)}
                    onChange={(event) =>
                      setMilestoneDraft((draft) => ({ ...draft, dueAt: event.target.value }))
                    }
                  />
                  <select
                    className={INPUT_CLASS}
                    disabled={!canRunAction}
                    value={milestoneDraft.status}
                    onChange={(event) =>
                      setMilestoneDraft((draft) => ({
                        ...draft,
                        status: event.target.value as MilestoneDraft['status'],
                      }))
                    }
                  >
                    {MILESTONE_STATUSES.map((milestoneStatus) => (
                      <option key={milestoneStatus} value={milestoneStatus}>
                        {milestoneStatus}
                      </option>
                    ))}
                  </select>
                  <input
                    className={INPUT_CLASS}
                    disabled={!canRunAction}
                    placeholder={t`Initial progress note`}
                    value={milestoneDraft.progressNote}
                    onChange={(event) =>
                      setMilestoneDraft((draft) => ({ ...draft, progressNote: event.target.value }))
                    }
                  />
                </div>
                <FormTextarea
                  className="mt-3 min-h-20"
                  disabled={!canRunAction}
                  placeholder={t`Milestone description`}
                  value={milestoneDraft.description}
                  onChange={(description) =>
                    setMilestoneDraft((draft) => ({ ...draft, description }))
                  }
                />
                <Button
                  className="mt-3"
                  disabled={!canRunAction || !hasMilestoneTitle}
                  type="button"
                  onClick={runCreateMilestone}
                >
                  {createMilestoneMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t`Create milestone`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <SectionTitle>
                <PlayCircle className="text-primary h-5 w-5" />
                {t`Moderation actions`}
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                  {t`Transition reason`}
                </p>
                <FormTextarea
                  className="min-h-32"
                  disabled={!hasApplication || isAnyMutationPending}
                  placeholder={t`Write an optional note. Reject, pause, and archive require a reason.`}
                  value={transitionReason}
                  onChange={setTransitionReason}
                />
                <p className="text-muted-foreground text-xs leading-5">
                  {isAnyMutationPending
                    ? t`Please wait. The previous action is still running.`
                    : t`Use the reason field when a transition requires a reason.`}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                  {t`Review workflow`}
                </p>
                {/* The currently-valid transition is shown as a primary button so the
                    expected next step is obvious; not-yet-applicable ones stay outlined
                    and de-emphasized. */}
                <Button
                  className={`w-full justify-start ${canFormalVerify ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canFormalVerify}
                  type="button"
                  variant={canFormalVerify ? 'default' : 'outline'}
                  onClick={runFormalVerify}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t`Formal verify`}
                </Button>
                <Button
                  className={`w-full justify-start ${canStartEvaluation ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canStartEvaluation}
                  type="button"
                  variant={canStartEvaluation ? 'default' : 'outline'}
                  onClick={runStartEvaluation}
                >
                  <Star className="h-4 w-4" />
                  {t`Start evaluation`}
                </Button>
                <Button
                  className={`w-full justify-start ${canApprove ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canApprove}
                  type="button"
                  variant={canApprove ? 'default' : 'outline'}
                  onClick={() => setConfirmAction('approve')}
                >
                  <UserRoundCheck className="h-4 w-4" />
                  {t`Approve`}
                </Button>
                <Button
                  className={`w-full justify-start ${canReject ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canReject}
                  type="button"
                  variant={canReject ? 'destructive' : 'outline'}
                  onClick={() => setConfirmAction('reject')}
                >
                  <MessageSquareText className="h-4 w-4" />
                  {t`Reject`}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                  {t`Delivery workflow`}
                </p>
                <Button
                  className={`w-full justify-start ${canStartOnboarding ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canStartOnboarding}
                  type="button"
                  variant={canStartOnboarding ? 'default' : 'outline'}
                  onClick={() => setConfirmAction('startOnboarding')}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t`Start onboarding`}
                </Button>
                <Button
                  className={`w-full justify-start ${canActivateProject ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canActivateProject}
                  type="button"
                  variant={canActivateProject ? 'default' : 'outline'}
                  onClick={() => setConfirmAction('activate')}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t`Activate project`}
                </Button>
                <Button
                  className={`w-full justify-start ${canPauseProject ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canPauseProject}
                  type="button"
                  variant={canPauseProject ? 'default' : 'outline'}
                  onClick={() => setConfirmAction('pause')}
                >
                  <MessageSquareText className="h-4 w-4" />
                  {t`Pause project`}
                </Button>
                <Button
                  className={`w-full justify-start ${canCompleteProject ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canCompleteProject}
                  type="button"
                  variant={canCompleteProject ? 'default' : 'outline'}
                  onClick={() => setConfirmAction('complete')}
                >
                  <NotebookPen className="h-4 w-4" />
                  {t`Complete project`}
                </Button>
                <Button
                  className={`w-full justify-start ${canArchive ? '' : 'opacity-60'}`}
                  disabled={!canRunAction || !canArchive}
                  type="button"
                  variant={canArchive ? 'destructive' : 'outline'}
                  onClick={() => setConfirmAction('archive')}
                >
                  <ArchiveIcon className="h-4 w-4" />
                  {t`Archive`}
                </Button>
              </div>

              {isAnyMutationPending && (
                <div className="border-border bg-muted text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t`Updating application...`}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle>
                <DollarSign className="text-primary h-5 w-5" />
                {t`Grant budget`}
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-border bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                <span className="text-foreground font-semibold">{t`Current budget`}:</span>{' '}
                {grantBudgetDisplay}
              </div>
              <p className="text-muted-foreground text-xs leading-5">
                {canSetGrantBudget
                  ? t`Set the approved grant budget in EUR for this project.`
                  : t`Grant budget can be set after the application is approved.`}
              </p>
              <div className="flex flex-col gap-2">
                <label className="block">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                    {t`Amount (EUR)`}
                  </span>
                  <input
                    className={`${INPUT_CLASS} mt-2`}
                    disabled={!canRunAction || !canSetGrantBudget}
                    min={0}
                    placeholder="e.g. 5000"
                    step="0.01"
                    type="number"
                    value={grantBudgetInput}
                    onChange={(event) => setGrantBudgetInput(event.target.value)}
                  />
                </label>
                <Button
                  className="w-full justify-start"
                  disabled={!canRunAction || !canSetGrantBudget || !grantBudgetInput.trim()}
                  type="button"
                  variant="outline"
                  onClick={runUpdateGrantBudget}
                >
                  {updateGrantBudgetMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t`Set grant budget`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        confirmLabel={t`Approve`}
        description={t`Approve this application and move it to the approved state.`}
        loading={approveMutation.isPending}
        open={confirmAction === 'approve'}
        title={t`Approve application?`}
        onConfirm={() => {
          runApprove();
          closeConfirm();
        }}
        onOpenChange={(open) => (open ? undefined : closeConfirm())}
      />

      <ConfirmDialog
        confirmDisabled={!hasTransitionReason}
        confirmLabel={t`Reject`}
        description={t`Rejecting an application is irreversible. Provide a reason that will be recorded on the decision.`}
        destructive
        loading={rejectMutation.isPending}
        open={confirmAction === 'reject'}
        title={t`Reject application?`}
        onConfirm={() => {
          runReject();
          closeConfirm();
        }}
        onOpenChange={(open) => (open ? undefined : closeConfirm())}
      >
        <div className="space-y-2">
          <Label htmlFor="reject-reason">{t`Reason`}</Label>
          <FormTextarea
            placeholder={t`Explain why this application is being rejected...`}
            value={transitionReason}
            onChange={setTransitionReason}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        confirmLabel={t`Start onboarding`}
        description={t`Move this approved application into the onboarding stage.`}
        loading={startOnboardingMutation.isPending}
        open={confirmAction === 'startOnboarding'}
        title={t`Start onboarding?`}
        onConfirm={() => {
          runStartOnboarding();
          closeConfirm();
        }}
        onOpenChange={(open) => (open ? undefined : closeConfirm())}
      />

      <ConfirmDialog
        confirmLabel={t`Activate project`}
        description={t`Activate this project so delivery tracking can begin.`}
        loading={activateMutation.isPending}
        open={confirmAction === 'activate'}
        title={t`Activate project?`}
        onConfirm={() => {
          runActivate();
          closeConfirm();
        }}
        onOpenChange={(open) => (open ? undefined : closeConfirm())}
      />

      <ConfirmDialog
        confirmDisabled={!hasTransitionReason}
        confirmLabel={t`Pause project`}
        description={t`Pause this active project. Provide a reason that will be recorded.`}
        loading={pauseMutation.isPending}
        open={confirmAction === 'pause'}
        title={t`Pause project?`}
        onConfirm={() => {
          runPause();
          closeConfirm();
        }}
        onOpenChange={(open) => (open ? undefined : closeConfirm())}
      >
        <div className="space-y-2">
          <Label htmlFor="pause-reason">{t`Reason`}</Label>
          <FormTextarea
            placeholder={t`Explain why this project is being paused...`}
            value={transitionReason}
            onChange={setTransitionReason}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        confirmLabel={t`Complete project`}
        description={t`Mark this project as completed. Completion is terminal and cannot be undone.`}
        loading={completeMutation.isPending}
        open={confirmAction === 'complete'}
        title={t`Complete project?`}
        onConfirm={() => {
          runComplete();
          closeConfirm();
        }}
        onOpenChange={(open) => (open ? undefined : closeConfirm())}
      />

      <ConfirmDialog
        confirmDisabled={!hasTransitionReason}
        confirmLabel={t`Archive`}
        description={t`Archiving is irreversible. Provide a reason that will be recorded on the application.`}
        destructive
        loading={archiveMutation.isPending}
        open={confirmAction === 'archive'}
        title={t`Archive application?`}
        onConfirm={() => {
          runArchive();
          closeConfirm();
        }}
        onOpenChange={(open) => (open ? undefined : closeConfirm())}
      >
        <div className="space-y-2">
          <Label htmlFor="archive-reason">{t`Reason`}</Label>
          <FormTextarea
            placeholder={t`Explain why this application is being archived...`}
            value={transitionReason}
            onChange={setTransitionReason}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
