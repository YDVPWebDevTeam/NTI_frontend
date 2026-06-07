'use client';

import { use, useMemo, useState } from 'react';
import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ClipboardCheck, FileText, Loader2, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  getAdminApplicationsControllerListProgramAApplicationsQueryKey,
  useAdminApplicationsControllerListProgramAApplications,
} from 'lib/api/admin/admin';
import {
  getApplicationsControllerFindByIdQueryKey,
  getApplicationsControllerListEvaluationsQueryKey,
  useApplicationsControllerCreateEvaluation,
  useApplicationsControllerFindById,
  useApplicationsControllerGetEligibilitySignals,
  useApplicationsControllerListEvaluations,
  useApplicationsControllerListSections,
} from 'lib/api/applications/applications';
import { clampNumber, isWithinRange, parseNumericInput } from 'lib/validation/numeric';
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
const MIN_SCORE = 0;
const MAX_SCORE = 100;

type ScoreState = Record<EvaluationCriterion['code'], string>;

const DEFAULT_SCORE_STATE: ScoreState = {
  TECHNICAL_QUALITY: String(DEFAULT_SCORE),
  BUSINESS_VALUE: String(DEFAULT_SCORE),
  TEAM_CAPABILITY: String(DEFAULT_SCORE),
};

const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const PRIMARY_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-primary bg-primary text-primary-foreground hover:bg-primary/90`;
const OUTLINE_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-border bg-card text-foreground hover:bg-muted`;
const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-4 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

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
  const [evaluationScores, setEvaluationScores] = useState<ScoreState>(DEFAULT_SCORE_STATE);

  const queryClient = useQueryClient();

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
        // Invalidate every query that reflects this application's evaluation state so
        // the detail view, the evaluations list, and the admin/evaluating queue (which
        // drives the dashboard badge/queue) all refresh instead of going stale.
        void queryClient.invalidateQueries({
          queryKey: getApplicationsControllerListEvaluationsQueryKey(applicationId),
        });
        void queryClient.invalidateQueries({
          queryKey: getApplicationsControllerFindByIdQueryKey(applicationId),
        });
        void queryClient.invalidateQueries({
          queryKey: getAdminApplicationsControllerListProgramAApplicationsQueryKey(),
        });
      },
      onError: (error: unknown) => toast.error(getErrorMessage(error)),
    },
  });

  const application = applicationQuery.data;
  const status = application?.status;

  const queueRow = findApplicationRow(applicationsQuery.data, applicationId);
  // The queue row carries human-readable names, but a deep-link to an application
  // outside the EVALUATING list won't be in that list. Fall back to any team/call
  // fields present on the detail DTO (names if available, otherwise the IDs) so the
  // summary still shows something useful instead of "Not available".
  const teamName = toText(
    getNestedValue(queueRow, ['team', 'name']),
    toText(getNestedValue(application, ['team', 'name']) ?? application?.teamId, t`Not available`),
  );
  const callTitle = toText(
    getNestedValue(queueRow, ['call', 'title']),
    toText(getNestedValue(application, ['call', 'title']) ?? application?.callId, t`Not available`),
  );
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

      const nextScores: ScoreState = { ...DEFAULT_SCORE_STATE };

      for (const score of ownEvaluation.scores ?? []) {
        const code = score.criterionCode as EvaluationCriterion['code'];

        if (code in nextScores) {
          const parsed = parseNumericInput(String(score.score));

          nextScores[code] = String(
            parsed === null ? DEFAULT_SCORE : clampNumber(parsed, MIN_SCORE, MAX_SCORE),
          );
        }
      }

      setEvaluationScores(nextScores);
    }

    setIsEditing(true);
  };

  const RECOMMENDATION_OPTIONS = ['APPROVE', 'NEEDS_INFO', 'REJECT'];

  const runSaveEvaluation = () => {
    if (!canCreateEvaluation(status)) {
      toast.error(
        t`Evaluation can only be submitted after formal verification or during evaluation.`,
      );

      return;
    }

    if (!RECOMMENDATION_OPTIONS.includes(evaluationRecommendation)) {
      toast.error(t`Select a recommendation before submitting.`);

      return;
    }

    // HTML min/max are advisory only, so validate every criterion here. Each score
    // must be a finite number within 0–100 and present for all criteria.
    const validatedScores: { criterionCode: string; score: number }[] = [];

    for (const criterion of EVALUATION_CRITERIA) {
      const parsed = parseNumericInput(evaluationScores[criterion.code] ?? '');

      if (parsed === null || !isWithinRange(parsed, MIN_SCORE, MAX_SCORE)) {
        toast.error(
          t`Enter a score between ${MIN_SCORE} and ${MAX_SCORE} for "${criterion.label}".`,
        );

        return;
      }

      validatedScores.push({
        criterionCode: criterion.code,
        score: clampNumber(parsed, MIN_SCORE, MAX_SCORE),
      });
    }

    const data: CreateApplicationEvaluationDto = {
      recommendation: evaluationRecommendation,
      comment: evaluationComment.trim().length > 0 ? evaluationComment.trim() : undefined,
      scores: validatedScores,
    };

    createEvaluationMutation.mutate({ id: applicationId, data });
  };

  // Guard against showing the form while evaluations are still loading — otherwise a
  // user could submit a duplicate evaluation before the query resolves and reveals
  // they already have one.
  const showEvaluationForm = isEditing || (!evaluationsQuery.isLoading && !ownEvaluation);

  if (applicationQuery.isLoading) {
    return (
      <div className="border-border bg-card flex min-h-96 items-center justify-center rounded-2xl border">
        <div className="text-muted-foreground flex items-center gap-3 text-sm font-medium">
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
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm leading-6">
          {t`Unable to load application detail from the backend.`}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <ClipboardCheck className="text-primary h-5 w-5" />
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
            <ShieldCheck className="text-primary h-5 w-5" />
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
            <FileText className="text-primary h-5 w-5" />
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
            <Star className="text-primary h-5 w-5" />
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
            <div className="border-border bg-muted rounded-2xl border p-4">
              <p className="text-foreground font-semibold">
                {ownEvaluation ? t`Edit your evaluation` : t`Add your evaluation`}
              </p>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {t`Score each criterion from 0 to 100, choose a recommendation, and optionally add a comment.`}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {EVALUATION_CRITERIA.map((criterion) => (
                  <label key={criterion.code} className="block">
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.08em] uppercase">
                      {criterion.label}
                    </span>
                    <input
                      className={`${INPUT_CLASS} mt-2 font-semibold`}
                      max={MAX_SCORE}
                      min={MIN_SCORE}
                      type="number"
                      value={evaluationScores[criterion.code]}
                      onChange={(event) =>
                        setEvaluationScores((currentScores) => ({
                          ...currentScores,
                          [criterion.code]: event.target.value,
                        }))
                      }
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
              <p className="text-muted-foreground text-sm font-semibold">
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
