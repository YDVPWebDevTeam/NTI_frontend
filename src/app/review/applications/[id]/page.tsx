'use client';

import { use, useMemo, useRef, useState, type ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  ShieldCheck,
  Star,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { useAdminApplicationsControllerListProgramAApplications } from 'lib/api/admin/admin';
import {
  useApplicationsControllerCreateEvaluation,
  useApplicationsControllerFindById,
  useApplicationsControllerGetEligibilitySignals,
  useApplicationsControllerListEvaluations,
  useApplicationsControllerListSections,
} from 'lib/api/applications/applications';
import type {
  ApplicationDetailDto,
  ApplicationEvaluationDto,
  ApplicationSectionDto,
  CreateApplicationEvaluationDto,
} from 'lib/api/index.schemas';
import { ROUTES } from 'lib/constants';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

type ReviewApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

type ApplicationStatus = ApplicationDetailDto['status'];

type EvaluationCriterion = {
  code: 'TECHNICAL_QUALITY' | 'BUSINESS_VALUE' | 'TEAM_CAPABILITY';
  label: string;
};

type EligibilitySignalRow = {
  code: string;
  passed: boolean;
  reason: string;
};

const EVALUATION_CRITERIA: EvaluationCriterion[] = [
  { code: 'TECHNICAL_QUALITY', label: 'Technical quality' },
  { code: 'BUSINESS_VALUE', label: 'Business value' },
  { code: 'TEAM_CAPABILITY', label: 'Team capability' },
];

const DEFAULT_SCORE = 80;

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const PRIMARY_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-sky-600 bg-sky-600 text-white hover:bg-sky-500`;
const OUTLINE_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-slate-200 bg-white text-slate-950 hover:bg-slate-50`;
const INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('sk-SK', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const JSON_INDENT = 2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toText(value: unknown, fallback = '') {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';

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

function findApplicationRow(data: unknown, applicationId: string): unknown {
  return getApplicationsArray(data).find(
    (row) => isRecord(row) && toText(row.id, '') === applicationId,
  );
}

function formatDate(value: unknown, fallback = '—') {
  const textValue = toText(value, '');

  if (!textValue) return fallback;

  const date = new Date(textValue);

  if (Number.isNaN(date.getTime())) return fallback;

  return DATE_TIME_FORMATTER.format(date);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.length > 0) return error.message;
  if (isRecord(error) && typeof error.message === 'string' && error.message.length > 0) {
    return error.message;
  }

  return t`Something went wrong. Check the Network tab for details.`;
}

function canCreateEvaluation(status: ApplicationStatus | undefined) {
  return status === 'FORMALLY_VERIFIED' || status === 'EVALUATING';
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

function getEligibilitySignals(data: unknown): EligibilitySignalRow[] {
  const signals = getNestedValue(data, ['signals']);

  if (!Array.isArray(signals)) return [];

  return signals.filter(isRecord).map((signal) => ({
    code: toText(signal.code, t`Unknown signal`),
    passed: signal.passed === true,
    reason: toText(signal.reason, ''),
  }));
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

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function SectionCard({ section }: { section: ApplicationSectionDto }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-950">{prettySectionTitle(section.key)}</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          v{section.version}
        </span>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-50 p-4 text-sm leading-6 whitespace-pre-wrap text-slate-700">
        {renderJsonValue(section.valueJson)}
      </pre>
    </div>
  );
}

function EvaluationCard({
  evaluation,
  isOwn,
}: {
  evaluation: ApplicationEvaluationDto;
  isOwn: boolean;
}) {
  const scores = Array.isArray(evaluation.scores) ? evaluation.scores : [];

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{isOwn ? t`Your evaluation` : t`Reviewer`}</p>
          <p className="mt-1 text-sm text-slate-500">{formatDate(evaluation.createdAt)}</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {toText(evaluation.recommendation, t`No recommendation`)}
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

export default function ReviewApplicationDetailPage({ params }: ReviewApplicationDetailPageProps) {
  const { id: applicationId } = use(params);

  const { me } = useAuthenticatedUser();

  const [isEditing, setIsEditing] = useState(false);
  const [evaluationRecommendation, setEvaluationRecommendation] = useState('APPROVE');
  const [evaluationComment, setEvaluationComment] = useState('');
  const [evaluationScores, setEvaluationScores] = useState<
    Record<EvaluationCriterion['code'], number>
  >({
    TECHNICAL_QUALITY: DEFAULT_SCORE,
    BUSINESS_VALUE: DEFAULT_SCORE,
    TEAM_CAPABILITY: DEFAULT_SCORE,
  });
  const [errorToast, setErrorToast] = useState<{ id: number; message: string } | null>(null);
  const errorToastIdRef = useRef(0);

  const showActionError = (message: string) => {
    errorToastIdRef.current += 1;
    setErrorToast({ id: errorToastIdRef.current, message });
  };

  // The queue row is the authoritative source for team/call names, which the
  // detail DTO does not include.
  const applicationsQuery = useAdminApplicationsControllerListProgramAApplications<unknown>();
  const applicationQuery = useApplicationsControllerFindById<ApplicationDetailDto>(applicationId, {
    query: { enabled: applicationId.length > 0 },
  });
  const sectionsQuery = useApplicationsControllerListSections<ApplicationSectionDto[]>(
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

  const createEvaluationMutation = useApplicationsControllerCreateEvaluation({
    mutation: {
      onSuccess: () => {
        setIsEditing(false);
        void evaluationsQuery.refetch();
        void applicationsQuery.refetch();
      },
      onError: (error: unknown) => showActionError(getErrorMessage(error)),
    },
  });

  const application = applicationQuery.data;
  const status = application?.status;

  const queueRow = findApplicationRow(applicationsQuery.data, applicationId);
  const teamName = toText(getNestedValue(queueRow, ['team', 'name']), t`Not available`);
  const callTitle = toText(getNestedValue(queueRow, ['call', 'title']), t`Not available`);
  const submittedAt =
    toText(getNestedValue(queueRow, ['submittedAt'])) || toText(application?.submittedAt);

  const sections: ApplicationSectionDto[] = Array.isArray(sectionsQuery.data)
    ? sectionsQuery.data
    : [];
  const evaluations: ApplicationEvaluationDto[] = Array.isArray(evaluationsQuery.data)
    ? evaluationsQuery.data
    : [];
  const eligibilitySignals = useMemo(
    () => getEligibilitySignals(eligibilitySignalsQuery.data),
    [eligibilitySignalsQuery.data],
  );

  const ownEvaluation = useMemo(
    () => evaluations.find((evaluation) => evaluation.evaluatorId === me?.id) ?? null,
    [evaluations, me?.id],
  );
  const otherEvaluations = useMemo(
    () => evaluations.filter((evaluation) => evaluation.evaluatorId !== me?.id),
    [evaluations, me?.id],
  );

  const startEditing = () => {
    if (ownEvaluation) {
      setEvaluationRecommendation(toText(ownEvaluation.recommendation, 'APPROVE'));
      setEvaluationComment(toText(ownEvaluation.comment, ''));

      const nextScores = {
        TECHNICAL_QUALITY: DEFAULT_SCORE,
        BUSINESS_VALUE: DEFAULT_SCORE,
        TEAM_CAPABILITY: DEFAULT_SCORE,
      };

      for (const score of ownEvaluation.scores ?? []) {
        const code = score.criterionCode as EvaluationCriterion['code'];

        if (code in nextScores) {
          nextScores[code] = Number(score.score);
        }
      }

      setEvaluationScores(nextScores);
    }

    setIsEditing(true);
  };

  const runSaveEvaluation = () => {
    if (!canCreateEvaluation(status)) {
      showActionError(
        t`Evaluation can only be submitted after formal verification or during evaluation.`,
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

  const showEvaluationForm = isEditing || !ownEvaluation;

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

      <Link className={`${OUTLINE_BUTTON_CLASS} w-fit shadow-sm`} href={ROUTES.REVIEW.DASHBOARD}>
        <ArrowLeft className="h-4 w-4" />
        {t`Back to review queue`}
      </Link>

      {applicationQuery.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          {t`Unable to load application detail from the backend.`}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <ClipboardCheck className="h-5 w-5 text-sky-700" />
            {t`Application summary`}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <InfoRow label={t`Team`} value={teamName} />
          <InfoRow label={t`Call`} value={callTitle} />
          <InfoRow label={t`Submitted`} value={formatDate(submittedAt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <ShieldCheck className="h-5 w-5 text-sky-700" />
            {t`Eligibility signals`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {eligibilitySignalsQuery.isLoading && (
            <EmptyState>{t`Loading eligibility signals...`}</EmptyState>
          )}
          {!eligibilitySignalsQuery.isLoading && eligibilitySignals.length === 0 && (
            <EmptyState>{t`No eligibility signals were returned by the backend.`}</EmptyState>
          )}
          {eligibilitySignals.map((signal) => (
            <div
              key={signal.code}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              {signal.passed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{signal.code}</p>
                {signal.reason.length > 0 && (
                  <p className="mt-1 text-sm leading-6 text-slate-600">{signal.reason}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="h-5 w-5 text-sky-700" />
            {t`Application sections`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionsQuery.isLoading && <EmptyState>{t`Loading application sections...`}</EmptyState>}
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

          {ownEvaluation && !isEditing && (
            <div className="space-y-3">
              <EvaluationCard evaluation={ownEvaluation} isOwn />
              <button className={OUTLINE_BUTTON_CLASS} type="button" onClick={startEditing}>
                {t`Edit my evaluation`}
              </button>
            </div>
          )}

          {showEvaluationForm && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">
                {ownEvaluation ? t`Edit your evaluation` : t`Add your evaluation`}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t`Score each criterion from 0 to 100, choose a recommendation, and optionally add a comment.`}
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

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className={PRIMARY_BUTTON_CLASS}
                  disabled={createEvaluationMutation.isPending || !canCreateEvaluation(status)}
                  type="button"
                  onClick={runSaveEvaluation}
                >
                  {createEvaluationMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t`Save evaluation`}
                </button>
                {ownEvaluation && (
                  <button
                    className={OUTLINE_BUTTON_CLASS}
                    disabled={createEvaluationMutation.isPending}
                    type="button"
                    onClick={() => setIsEditing(false)}
                  >
                    {t`Cancel`}
                  </button>
                )}
              </div>
            </div>
          )}

          {otherEvaluations.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                {t`Other reviewers' evaluations`}
              </p>
              {otherEvaluations.map((evaluation) => (
                <EvaluationCard key={evaluation.id} evaluation={evaluation} isOwn={false} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
