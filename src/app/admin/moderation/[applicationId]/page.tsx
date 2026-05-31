'use client';

import { use, useState } from 'react';
import { t } from '@lingui/core/macro';
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  Loader2,
  MessageSquareText,
  NotebookPen,
  PlayCircle,
  ShieldCheck,
  Star,
  UserRoundCheck,
} from 'lucide-react';
import Link from 'next/link';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from 'components/shadcn';
import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import {
  demoProgramAApplicationDetail,
  demoProgramADocuments,
  demoProgramAEvaluations,
  demoProgramANeedsInfoItems,
  demoProgramASections,
} from 'features/admin-program-a/lib/demo-program-a-data';
import {
  useAdminApplicationsControllerActivate,
  useAdminApplicationsControllerApprove,
  useAdminApplicationsControllerArchive,
  useAdminApplicationsControllerComplete,
  useAdminApplicationsControllerFormalVerify,
  useAdminApplicationsControllerPause,
  useAdminApplicationsControllerReject,
  useAdminApplicationsControllerStartEvaluation,
  useAdminApplicationsControllerStartOnboarding,
} from 'lib/api/admin/admin';
import { useApplicationsControllerFindById } from 'lib/api/applications/applications';
import type { ApplicationDetailDto } from 'lib/api/index.schemas';
import { ROUTES } from 'lib/constants';

type AdminProgramAApplicationDetailPageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

function formatNullableDate(value: unknown, fallback = '—') {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return fallback;
}

function getDetailValue(value: string | undefined, fallback: string) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return fallback;
}

function getOptionalTransitionData(reason: string) {
  const trimmedReason = reason.trim();

  if (trimmedReason.length === 0) {
    return {};
  }

  return {
    reason: trimmedReason,
  };
}

function getRequiredTransitionData(reason: string) {
  return {
    reason: reason.trim(),
  };
}

function getActionDisabledLabel(isDemoApplication: boolean, hasApplication: boolean) {
  if (isDemoApplication) {
    return t`Actions are disabled for demo applications. Open a real application from the review queue to use lifecycle actions.`;
  }

  if (!hasApplication) {
    return t`Load a real application detail before running lifecycle actions.`;
  }

  return t`Use the note field below when a transition requires a reason.`;
}

export default function AdminProgramAApplicationDetailPage({
  params,
}: AdminProgramAApplicationDetailPageProps) {
  const { applicationId } = use(params);
  const [transitionReason, setTransitionReason] = useState('');

  const applicationQuery = useApplicationsControllerFindById<ApplicationDetailDto>(applicationId, {
    query: {
      enabled: applicationId.length > 0 && !applicationId.startsWith('demo-'),
    },
  });

  const refetchApplication = () => {
    void applicationQuery.refetch();
  };

  const formalVerifyMutation = useAdminApplicationsControllerFormalVerify({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const startEvaluationMutation = useAdminApplicationsControllerStartEvaluation({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const approveMutation = useAdminApplicationsControllerApprove({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const rejectMutation = useAdminApplicationsControllerReject({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const startOnboardingMutation = useAdminApplicationsControllerStartOnboarding({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const activateMutation = useAdminApplicationsControllerActivate({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const pauseMutation = useAdminApplicationsControllerPause({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const completeMutation = useAdminApplicationsControllerComplete({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const archiveMutation = useAdminApplicationsControllerArchive({
    mutation: {
      onSuccess: refetchApplication,
    },
  });

  const application = applicationQuery.data;
  const isDemoApplication = applicationId.startsWith('demo-');
  const shouldShowDemoData = isDemoApplication || applicationQuery.isError;
  const hasRealApplication = !isDemoApplication && Boolean(application);
  const canRunRealAction = hasRealApplication && !applicationQuery.isLoading;
  const hasTransitionReason = transitionReason.trim().length > 0;

  const isAnyTransitionPending =
    formalVerifyMutation.isPending ||
    startEvaluationMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    startOnboardingMutation.isPending ||
    activateMutation.isPending ||
    pauseMutation.isPending ||
    completeMutation.isPending ||
    archiveMutation.isPending;

  const status = application?.status ?? demoProgramAApplicationDetail.status;
  const displayApplicationId = application?.id ?? applicationId;
  const callId = getDetailValue(application?.callId, demoProgramAApplicationDetail.callTitle);
  const teamId = getDetailValue(application?.teamId, demoProgramAApplicationDetail.teamName);
  const createdById = getDetailValue(
    application?.createdById,
    demoProgramAApplicationDetail.leaderEmail,
  );
  const submittedAt = formatNullableDate(
    application?.submittedAt,
    demoProgramAApplicationDetail.submittedAt,
  );
  const createdAt = formatNullableDate(application?.createdAt);
  const updatedAt = formatNullableDate(
    application?.updatedAt,
    demoProgramAApplicationDetail.lastActivity,
  );
  const pageTitle = shouldShowDemoData
    ? demoProgramAApplicationDetail.teamName
    : t`Program A application`;
  const actionHelperText = getActionDisabledLabel(isDemoApplication, hasRealApplication);

  const runFormalVerify = () => {
    if (!canRunRealAction) {
      return;
    }

    formalVerifyMutation.mutate({
      id: applicationId,
      data: getOptionalTransitionData(transitionReason),
    });
  };

  const runStartEvaluation = () => {
    if (!canRunRealAction) {
      return;
    }

    startEvaluationMutation.mutate({
      id: applicationId,
      data: getOptionalTransitionData(transitionReason),
    });
  };

  const runApprove = () => {
    if (!canRunRealAction) {
      return;
    }

    approveMutation.mutate({
      id: applicationId,
      data: getOptionalTransitionData(transitionReason),
    });
  };

  const runReject = () => {
    if (!canRunRealAction || !hasTransitionReason) {
      return;
    }

    rejectMutation.mutate({
      id: applicationId,
      data: getRequiredTransitionData(transitionReason),
    });
  };

  const runStartOnboarding = () => {
    if (!canRunRealAction) {
      return;
    }

    startOnboardingMutation.mutate({
      id: applicationId,
    });
  };

  const runActivate = () => {
    if (!canRunRealAction) {
      return;
    }

    activateMutation.mutate({
      id: applicationId,
    });
  };

  const runPause = () => {
    if (!canRunRealAction || !hasTransitionReason) {
      return;
    }

    pauseMutation.mutate({
      id: applicationId,
      data: getRequiredTransitionData(transitionReason),
    });
  };

  const runComplete = () => {
    if (!canRunRealAction) {
      return;
    }

    completeMutation.mutate({
      id: applicationId,
    });
  };

  const runArchive = () => {
    if (!canRunRealAction || !hasTransitionReason) {
      return;
    }

    archiveMutation.mutate({
      id: applicationId,
      data: getRequiredTransitionData(transitionReason),
    });
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
      <Button asChild variant="outline" className="bg-white">
        <Link href={ROUTES.ADMIN.PROGRAM_A_MODERATION}>
          <ArrowLeft className="h-4 w-4" />
          {t`Back to review queue`}
        </Link>
      </Button>

      {applicationQuery.isError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t`Unable to load live application detail. Showing demo layout data for development preview.`}
        </div>
      )}

      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <ClipboardCheck className="h-5 w-5" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-2xl text-slate-950">{pageTitle}</CardTitle>
                <ProgramAStatusBadge status={status} />
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {t`Program A application detail with review state, application metadata, documents, evaluations, needs-info workflow, and delivery follow-up.`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                {t`Application ID`}
              </p>
              <p className="mt-1 font-medium text-slate-950">{displayApplicationId}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{t`Call`}</p>
              <p className="mt-1 font-semibold break-all text-slate-950">{callId}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{t`Submitted`}</p>
              <p className="mt-1 font-semibold text-slate-950">{submittedAt}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{t`Team`}</p>
              <p className="mt-1 font-semibold break-all text-slate-950">{teamId}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{t`Created by`}</p>
              <p className="mt-1 font-semibold break-all text-slate-950">{createdById}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{t`Created at`}</p>
              <p className="mt-1 font-semibold text-slate-950">{createdAt}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{t`Updated at`}</p>
              <p className="mt-1 font-semibold text-slate-950">{updatedAt}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                <FileText className="h-5 w-5 text-sky-700" />
                {t`Application content`}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                {t`The current application detail DTO contains only core metadata. Full application answers should be connected when the backend exposes them in the detail response or a separate endpoint.`}
              </div>

              {demoProgramASections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-950">{section.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                <ShieldCheck className="h-5 w-5 text-sky-700" />
                {t`Documents`}
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-2">
              {demoProgramADocuments.map((document) => (
                <div
                  key={document}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                >
                  <span className="text-sm font-medium text-slate-800">{document}</span>
                  <Button variant="outline" size="sm" className="bg-white">
                    {t`Open`}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                <Star className="h-5 w-5 text-sky-700" />
                {t`Evaluations`}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {demoProgramAEvaluations.map((evaluation) => (
                <div key={evaluation.evaluator} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{evaluation.evaluator}</p>
                      <p className="text-sm text-slate-500">{evaluation.comment}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        {evaluation.recommendation}
                      </Badge>
                      <Badge variant="outline">{evaluation.score}</Badge>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                <p className="font-semibold text-slate-950">{t`Add evaluation`}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {t`Criterion-based scoring form will be connected to the backend in the next steps.`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                <MessageSquareText className="h-5 w-5 text-sky-700" />
                {t`Needs-info thread`}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {demoProgramANeedsInfoItems.map((item) => (
                <div key={item.message} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">{item.message}</p>
                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-50 text-slate-700"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    {item.reply}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                <NotebookPen className="h-5 w-5 text-sky-700" />
                {t`Mentorship notes and milestones`}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                <p className="font-semibold text-slate-950">{t`Delivery phase`}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {t`Mentor assignment, mentorship notes, and milestones will be enabled for approved Program A applications.`}
                </p>
              </div>

              <Textarea className="min-h-28 bg-white" placeholder={t`Write a mentorship note...`} />

              <Button variant="outline" className="bg-white">
                {t`Add note`}
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card className="border-slate-200 bg-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
                <PlayCircle className="h-5 w-5 text-sky-700" />
                {t`Moderation actions`}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                  {t`Transition note`}
                </p>
                <Textarea
                  className="min-h-24 bg-white"
                  value={transitionReason}
                  placeholder={t`Write an optional note. Reject, pause, and archive require a reason.`}
                  onChange={(event) => setTransitionReason(event.target.value)}
                />
                <p className="text-xs leading-5 text-slate-500">{actionHelperText}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                  {t`Review workflow`}
                </p>

                <Button
                  className="w-full justify-start rounded-xl bg-sky-600 text-white hover:bg-sky-500"
                  disabled={!canRunRealAction || isAnyTransitionPending}
                  onClick={runFormalVerify}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t`Formal verify`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending}
                  onClick={runStartEvaluation}
                >
                  <Star className="h-4 w-4" />
                  {t`Start evaluation`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending}
                  onClick={runApprove}
                >
                  <UserRoundCheck className="h-4 w-4" />
                  {t`Approve`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending || !hasTransitionReason}
                  onClick={runReject}
                >
                  <MessageSquareText className="h-4 w-4" />
                  {t`Reject`}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                  {t`Delivery workflow`}
                </p>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending}
                  onClick={runStartOnboarding}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t`Start onboarding`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending}
                  onClick={runActivate}
                >
                  <PlayCircle className="h-4 w-4" />
                  {t`Activate project`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending || !hasTransitionReason}
                  onClick={runPause}
                >
                  <MessageSquareText className="h-4 w-4" />
                  {t`Pause project`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending}
                  onClick={runComplete}
                >
                  <NotebookPen className="h-4 w-4" />
                  {t`Complete project`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-white"
                  disabled={!canRunRealAction || isAnyTransitionPending || !hasTransitionReason}
                  onClick={runArchive}
                >
                  <MessageSquareText className="h-4 w-4" />
                  {t`Archive`}
                </Button>
              </div>

              {isAnyTransitionPending && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t`Updating application status...`}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
