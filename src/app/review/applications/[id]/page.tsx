'use client';

import { use, useMemo, useRef, useState } from 'react';
import { t } from '@lingui/core/macro';
import { ArrowLeft, ClipboardCheck, FileText, Loader2, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
import {
  findApplicationRow,
  formatDate,
  getErrorMessage,
  getNestedValue,
  isRecord,
  toText,
} from 'lib/review/application-display';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  type EligibilitySignalRow,
  EligibilitySignalsCard,
  EmptyState,
  EvaluationCard,
  InfoRow,
  SectionCard,
} from './_review-components';

type ReviewApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

type ApplicationStatus = ApplicationDetailDto['status'];

type EvaluationCriterion = {
  code: 'TECHNICAL_QUALITY' | 'BUSINESS_VALUE' | 'TEAM_CAPABILITY';
  label: string;
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

function canCreateEvaluation(status: ApplicationStatus | undefined) {
  return status === 'FORMALLY_VERIFIED' || status === 'EVALUATING';
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
      onError: (error: unknown) => toast.error(getErrorMessage(error)),
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
      toast.error(
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

  // Guard against showing the form while evaluations are still loading — otherwise a
  // user could submit a duplicate evaluation before the query resolves and reveals
  // they already have one.
  const showEvaluationForm = isEditing || (!evaluationsQuery.isLoading && !ownEvaluation);

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
        <CardContent>
          <EligibilitySignalsCard
            isLoading={eligibilitySignalsQuery.isLoading}
            signals={eligibilitySignals}
          />
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
