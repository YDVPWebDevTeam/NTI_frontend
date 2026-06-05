'use client';

import { use, useMemo, useRef, useState, type ReactNode } from 'react';
import { t } from '@lingui/core/macro';
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

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const PRIMARY_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-sky-600 bg-sky-600 text-white hover:bg-sky-500`;
const OUTLINE_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-slate-200 bg-white text-slate-950 hover:bg-slate-50`;
const DANGER_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`;
const INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

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
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-900">
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
    <pre className="overflow-x-auto rounded-2xl bg-slate-50 p-4 text-sm leading-6 whitespace-pre-wrap text-slate-700">
      {renderJsonValue(value)}
    </pre>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-slate-100 px-6 py-5">{children}</div>;
}

function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">{children}</h2>;
}

function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
      {children}
    </div>
  );
}

function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="fixed right-6 bottom-6 z-50 max-w-md rounded-2xl border border-rose-200 bg-white p-4 text-sm leading-6 text-rose-700 shadow-2xl shadow-rose-950/10"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-bold text-rose-700">
          !
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-rose-800">{t`Action failed`}</p>
          <p className="mt-1 text-rose-700">{message}</p>
        </div>
        <button
          className="rounded-lg px-2 py-1 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
          type="button"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function NativeTextarea({
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
    <textarea
      className={`min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{prettySectionTitle(section.key)}</h3>
          <p className="mt-1 text-sm text-slate-500">{getSectionDescription(section.key)}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          v{section.version}
        </span>
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
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{t`Evaluator`}</p>
          <p className="mt-1 text-sm text-slate-500">{formatDate(evaluation.createdAt)}</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {evaluation.recommendation ?? t`No recommendation`}
        </span>
      </div>

      {toText(evaluation.comment, '').length > 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          {toText(evaluation.comment)}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {scores.map((score) => (
          <div key={score.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
              {score.criterionCode}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-950">{score.score}/100</p>
            {toText(score.comment, '').length > 0 && (
              <p className="mt-1 text-xs leading-5 text-slate-600">{toText(score.comment)}</p>
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
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{toText(item.message, '—')}</p>
          <p className="mt-1 text-sm text-slate-500">{formatDate(item.createdAt)}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {item.status}
        </span>
      </div>

      {replies.length > 0 && (
        <div className="mt-4 space-y-2">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"
            >
              <p>{reply.message}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(reply.createdAt)}</p>
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
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm leading-6 text-slate-900">{note.content}</p>
      <p className="mt-3 text-xs text-slate-500">
        {authorName.length > 0 ? authorName : note.author.email} · {formatDate(note.createdAt)}
      </p>
    </div>
  );
}

export default function AdminProgramAApplicationDetailPage({
  params,
}: AdminProgramAApplicationDetailPageProps) {
  const { applicationId } = use(params);

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
  const [errorToast, setErrorToast] = useState<{ id: number; message: string } | null>(null);
  const errorToastIdRef = useRef(0);

  const showActionError = (message: string) => {
    errorToastIdRef.current += 1;

    setActionError(message);
    setErrorToast({ id: errorToastIdRef.current, message });
  };

  // Queue query — used as the authoritative source for mentor assignment state,
  // because ApplicationDetailDto does not include mentor fields.
  const programAApplicationsQuery = useAdminApplicationsControllerListProgramAApplications();

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

  const refetchAllData = () => {
    refetchApplicationData();
    void sectionsQuery.refetch();
    refetchReviewData();
    refetchMentorshipData();
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
      showActionError(t`Enter a mentor user ID before assigning a mentor.`);

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

    const parsed = parseFloat(grantBudgetInput.trim());

    if (!grantBudgetInput.trim() || Number.isNaN(parsed) || parsed < 0) {
      showActionError(t`Enter a valid non-negative number for the grant budget.`);

      return;
    }

    const data: UpdateApplicationGrantBudgetDto = {
      grantBudget: parsed as unknown as UpdateApplicationGrantBudgetDto['grantBudget'],
    };

    updateGrantBudgetMutation.mutate({ id: applicationId, data });
  };

  if (applicationQuery.isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t`Loading application detail...`}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorToast && (
        <ErrorToast message={errorToast.message} onDismiss={() => setErrorToast(null)} />
      )}

      <Link
        className={`${OUTLINE_BUTTON_CLASS} w-fit shadow-sm`}
        href={ROUTES.ADMIN.PROGRAM_A_MODERATION}
      >
        <ArrowLeft className="h-4 w-4" />
        {t`Back to review queue`}
      </Link>

      {(applicationQuery.isError || actionError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          {actionError ?? t`Unable to load application detail from the backend.`}
        </div>
      )}

      <Card>
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">{applicationTitle}</h1>
                {status && <ProgramAStatusBadge status={status} />}
              </div>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                {t`Review metadata, evaluate the application, request information, assign a mentor, and manage Program A delivery milestones.`}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {applicationInfoRows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                  {row.label}
                </p>
                <p className="mt-2 font-semibold break-words text-slate-950">
                  {toText(row.value, '—')}
                </p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 xl:col-span-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                {t`Decision reason`}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-800">
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
              <CardTitle>
                <FileText className="h-5 w-5 text-sky-700" />
                {t`Application sections`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionsQuery.isLoading && (
                <EmptyState>{t`Loading application sections...`}</EmptyState>
              )}
              {!sectionsQuery.isLoading && sections.length === 0 && (
                <EmptyState>{t`No application sections were returned by the backend.`}</EmptyState>
              )}
              {sections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Star className="h-5 w-5 text-sky-700" />
                {t`Evaluations`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluationsQuery.isLoading && <EmptyState>{t`Loading evaluations...`}</EmptyState>}
              {!evaluationsQuery.isLoading && evaluations.length === 0 && (
                <EmptyState>{t`No evaluations were returned by the backend.`}</EmptyState>
              )}
              {evaluations.map((evaluation) => (
                <EvaluationCard key={evaluation.id} evaluation={evaluation} />
              ))}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{t`Add evaluation`}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {t`Create criterion-based scoring after formal verification or during evaluation.`}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {EVALUATION_CRITERIA.map((criterion) => (
                    <label key={criterion.code} className="block">
                      <span className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                        {criterion.label}
                      </span>
                      <input
                        className={`${INPUT_CLASS} mt-2 font-semibold`}
                        max={100}
                        min={0}
                        type="number"
                        value={evaluationScores[criterion.code]}
                        onChange={(event) =>
                          setEvaluationScores((currentScores) => ({
                            ...currentScores,
                            [criterion.code]: Number(event.target.value),
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                  <label className="block">
                    <span className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
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
                    <span className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                      {t`Comment`}
                    </span>
                    <input
                      className={`${INPUT_CLASS} mt-2`}
                      value={evaluationComment}
                      onChange={(event) => setEvaluationComment(event.target.value)}
                    />
                  </label>
                </div>

                <button
                  className={`${PRIMARY_BUTTON_CLASS} mt-4`}
                  disabled={!canRunAction || !canCreateEvaluation(status)}
                  type="button"
                  onClick={runCreateEvaluation}
                >
                  {createEvaluationMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t`Save evaluation`}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <MessageSquareText className="h-5 w-5 text-sky-700" />
                {t`Needs-info thread`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {needsInfoQuery.isLoading && (
                <EmptyState>{t`Loading needs-info thread...`}</EmptyState>
              )}
              {!needsInfoQuery.isLoading && needsInfoItems.length === 0 && (
                <EmptyState>{t`No needs-info messages were returned by the backend.`}</EmptyState>
              )}
              {needsInfoItems.map((item) => (
                <NeedsInfoCard key={item.id} item={item} />
              ))}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{t`Request additional information`}</p>
                <NativeTextarea
                  disabled={!canRunAction}
                  placeholder={t`Explain what the team has to clarify or upload...`}
                  value={needsInfoMessage}
                  onChange={setNeedsInfoMessage}
                />
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">
                  <label className="block md:w-56">
                    <span className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                      {t`Due date`}
                    </span>
                    <input
                      className={`${INPUT_CLASS} mt-2`}
                      disabled={!canRunAction}
                      type="date"
                      value={needsInfoDueAt}
                      onChange={(event) => setNeedsInfoDueAt(event.target.value)}
                    />
                  </label>
                  <button
                    className={OUTLINE_BUTTON_CLASS}
                    disabled={!canRunAction || !hasNeedsInfoMessage}
                    type="button"
                    onClick={runCreateNeedsInfo}
                  >
                    {createNeedsInfoMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {t`Create needs-info item`}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <NotebookPen className="h-5 w-5 text-sky-700" />
                {t`Mentorship notes`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{t`Mentor assignment`}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {t`Assign or update the Program A mentor responsible for delivery follow-up.`}
                </p>
                <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-950">{t`Current mentor`}:</span>{' '}
                  {mentorAssigned ? t`Assigned` : t`Not assigned`}
                </div>
                <div className="mt-3 flex flex-col gap-3 md:flex-row">
                  <input
                    className={`${INPUT_CLASS} min-w-0 flex-1`}
                    disabled={!canRunAction}
                    placeholder={t`Mentor user id`}
                    value={mentorUserId}
                    onChange={(event) => setMentorUserId(event.target.value)}
                  />
                  <button
                    className={OUTLINE_BUTTON_CLASS}
                    disabled={!canRunAction || !hasMentorUserId}
                    type="button"
                    onClick={runAssignMentor}
                  >
                    {assignMentorMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <UserRoundPlus className="h-4 w-4" />
                    {mentorAssigned ? t`Reassign mentor` : t`Assign mentor`}
                  </button>
                </div>
              </div>

              {mentorshipNotesQuery.isLoading && (
                <EmptyState>{t`Loading mentorship notes...`}</EmptyState>
              )}
              {!mentorshipNotesQuery.isLoading && mentorshipNotes.length === 0 && (
                <EmptyState>{t`No mentorship notes were returned by the backend.`}</EmptyState>
              )}
              {mentorshipNotes.map((note) => (
                <MentorshipNoteCard key={note.id} note={note} />
              ))}

              <NativeTextarea
                disabled={!canUseMentorshipNotes}
                placeholder={
                  mentorAssigned
                    ? t`Write a mentorship note...`
                    : t`Assign a mentor before adding mentorship notes.`
                }
                value={mentorshipNote}
                onChange={setMentorshipNote}
              />
              <button
                className={OUTLINE_BUTTON_CLASS}
                disabled={!canUseMentorshipNotes || !hasMentorshipNote}
                type="button"
                onClick={runCreateMentorshipNote}
              >
                {createMentorshipNoteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t`Add note`}
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <NotebookPen className="h-5 w-5 text-sky-700" />
                {t`Program A milestones`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestonesQuery.isLoading && (
                <EmptyState>{t`Loading Program A milestones...`}</EmptyState>
              )}
              {!milestonesQuery.isLoading && milestones.length === 0 && (
                <EmptyState>{t`No Program A milestones were returned by the backend.`}</EmptyState>
              )}

              {milestones.map((milestone) => {
                const progressDraft =
                  milestoneProgressDrafts[milestone.id] ?? toText(milestone.progressNote, '');

                return (
                  <div key={milestone.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{milestone.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {t`Due`}: {formatDate(milestone.dueAt)}
                        </p>
                      </div>
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
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
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {milestone.description}
                      </p>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <label className="block">
                        <span className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                          {t`Progress note`}
                        </span>
                        <input
                          className={`${INPUT_CLASS} mt-2`}
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
                      <button
                        className={OUTLINE_BUTTON_CLASS}
                        disabled={!canRunAction}
                        type="button"
                        onClick={() =>
                          runUpdateMilestone(milestone, {
                            progressNote: progressDraft.trim() || undefined,
                          })
                        }
                      >
                        {t`Save progress`}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{t`Create milestone`}</p>
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
                <NativeTextarea
                  className="mt-3 min-h-20"
                  disabled={!canRunAction}
                  placeholder={t`Milestone description`}
                  value={milestoneDraft.description}
                  onChange={(description) =>
                    setMilestoneDraft((draft) => ({ ...draft, description }))
                  }
                />
                <button
                  className={`${PRIMARY_BUTTON_CLASS} mt-3`}
                  disabled={!canRunAction || !hasMilestoneTitle}
                  type="button"
                  onClick={runCreateMilestone}
                >
                  {createMilestoneMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t`Create milestone`}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>
                <PlayCircle className="h-5 w-5 text-sky-700" />
                {t`Moderation actions`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                  {t`Transition reason`}
                </p>
                <NativeTextarea
                  className="min-h-32"
                  disabled={!hasApplication || isAnyMutationPending}
                  placeholder={t`Write an optional note. Reject, pause, and archive require a reason.`}
                  value={transitionReason}
                  onChange={setTransitionReason}
                />
                <p className="text-xs leading-5 text-slate-500">
                  {isAnyMutationPending
                    ? t`Please wait. The previous action is still running.`
                    : t`Use the reason field when a transition requires a reason.`}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                  {t`Review workflow`}
                </p>
                <button
                  className={`${PRIMARY_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canFormalVerify}
                  type="button"
                  onClick={runFormalVerify}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t`Formal verify`}
                </button>
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canStartEvaluation}
                  type="button"
                  onClick={runStartEvaluation}
                >
                  <Star className="h-4 w-4" />
                  {t`Start evaluation`}
                </button>
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canApprove}
                  type="button"
                  onClick={runApprove}
                >
                  <UserRoundCheck className="h-4 w-4" />
                  {t`Approve`}
                </button>
                <button
                  className={`${DANGER_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canReject || !hasTransitionReason}
                  type="button"
                  onClick={runReject}
                >
                  <MessageSquareText className="h-4 w-4" />
                  {t`Reject`}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                  {t`Delivery workflow`}
                </p>
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canStartOnboarding}
                  type="button"
                  onClick={runStartOnboarding}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t`Start onboarding`}
                </button>
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canActivateProject}
                  type="button"
                  onClick={runActivate}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t`Activate project`}
                </button>
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canPauseProject || !hasTransitionReason}
                  type="button"
                  onClick={runPause}
                >
                  <MessageSquareText className="h-4 w-4" />
                  {t`Pause project`}
                </button>
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canCompleteProject}
                  type="button"
                  onClick={runComplete}
                >
                  <NotebookPen className="h-4 w-4" />
                  {t`Complete project`}
                </button>
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canArchive || !hasTransitionReason}
                  type="button"
                  onClick={runArchive}
                >
                  <ArchiveIcon className="h-4 w-4" />
                  {t`Archive`}
                </button>
              </div>

              {isAnyMutationPending && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t`Updating application...`}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <DollarSign className="h-5 w-5 text-sky-700" />
                {t`Grant budget`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-950">{t`Current budget`}:</span>{' '}
                {grantBudgetDisplay}
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {canSetGrantBudget
                  ? t`Set the approved grant budget in EUR for this project.`
                  : t`Grant budget can be set after the application is approved.`}
              </p>
              <div className="flex flex-col gap-2">
                <label className="block">
                  <span className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
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
                <button
                  className={`${OUTLINE_BUTTON_CLASS} w-full justify-start`}
                  disabled={!canRunAction || !canSetGrantBudget || !grantBudgetInput.trim()}
                  type="button"
                  onClick={runUpdateGrantBudget}
                >
                  {updateGrantBudgetMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t`Set grant budget`}
                </button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
