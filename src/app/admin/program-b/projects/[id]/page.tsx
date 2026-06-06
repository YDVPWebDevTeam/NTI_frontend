'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

import { AdminErrorState, AdminLoadingState, formatAdminDateTime } from 'components/admin';
import { ProgramBDocumentManager } from 'components/company-dashboard/program-b-document-manager';
import { Button, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from 'components/shadcn';
import {
  CreateProgramBFinalAcceptanceDtoSide,
  programBProjectsControllerRequestDocumentDownload,
  ProgramBProjectDetailDtoStatus,
  useProgramBProjectsControllerAssignMentor,
  useProgramBProjectsControllerGetProject,
  useProgramBProjectsControllerListDocuments,
  useProgramBProjectsControllerListMentoringNotes,
  useProgramBProjectsControllerListMilestones,
  useProgramBProjectsControllerListAssignableMentors,
  useProgramBProjectsControllerListPoReviews,
  useProgramBProjectsControllerRecordFinalAcceptance,
  useProgramBProjectsControllerUpdateReward,
} from 'lib/api';
import { invalidateProgramBCompanyWorkspace } from 'lib/api-client/program-b-company';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { ROUTES } from 'lib/constants';
import {
  formatPersonName,
  formatUnknownDate,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { formatEnumLabel } from 'lib/utils';

const CONFLICT_STATUS = 409;

export default function AdminProgramBProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const projectQuery = useProgramBProjectsControllerGetProject(id);
  const milestonesQuery = useProgramBProjectsControllerListMilestones(id);
  const reviewsQuery = useProgramBProjectsControllerListPoReviews(id);
  const notesQuery = useProgramBProjectsControllerListMentoringNotes(id);
  const documentsQuery = useProgramBProjectsControllerListDocuments(id);
  const mentorsQuery = useProgramBProjectsControllerListAssignableMentors();
  const assignMentor = useProgramBProjectsControllerAssignMentor();
  const recordFinalAcceptance = useProgramBProjectsControllerRecordFinalAcceptance();

  const project = projectQuery.data;
  const milestones = milestonesQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const documents = documentsQuery.data ?? [];
  const mentors = mentorsQuery.data ?? [];
  const isProjectReadOnly = project?.status === ProgramBProjectDetailDtoStatus.CLOSED;
  const hasNtiFinalAcceptance = Boolean(project?.acceptedByNtiAt);

  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [rewardInput, setRewardInput] = useState('');
  const updateReward = useProgramBProjectsControllerUpdateReward();

  const refreshWorkspace = async () => {
    await invalidateProgramBCompanyWorkspace(queryClient, { projectId: id });
  };

  const reportMutationError = (error: unknown, fallback: string) => {
    if (isApiRequestError(error) && error.status === CONFLICT_STATUS) {
      toast.error(t`Closed Program B projects are read-only`);

      return;
    }

    toast.error(error instanceof Error ? error.message : fallback);
  };

  const handleAssignMentor = async () => {
    if (!selectedMentorId) {
      return;
    }

    try {
      await assignMentor.mutateAsync({ id, data: { mentorUserId: selectedMentorId } });
      toast.success(t`Mentor assigned.`);
      setSelectedMentorId('');
      await refreshWorkspace();
    } catch (error) {
      reportMutationError(error, t`Unable to assign mentor.`);
    }
  };

  const handleUpdateReward = async () => {
    const parsed = parseFloat(rewardInput.trim());

    if (!rewardInput.trim() || !Number.isFinite(parsed) || parsed < 0) {
      toast.error(t`Enter a valid non-negative number for the reward amount.`);

      return;
    }

    try {
      await updateReward.mutateAsync({
        id,
        data: {
          rewardPerMember: parsed as unknown as Parameters<
            typeof updateReward.mutateAsync
          >[0]['data']['rewardPerMember'],
        },
      });
      toast.success(t`Reward per member updated.`);
      setRewardInput('');
      await refreshWorkspace();
    } catch (error) {
      reportMutationError(error, t`Unable to update reward per member.`);
    }
  };

  const handleNtiAcceptance = async () => {
    try {
      await recordFinalAcceptance.mutateAsync({
        id,
        data: { side: CreateProgramBFinalAcceptanceDtoSide.NTI },
      });
      toast.success(t`NTI final acceptance recorded.`);
      await refreshWorkspace();
    } catch (error) {
      reportMutationError(error, t`Unable to record NTI final acceptance.`);
    }
  };

  if (projectQuery.isLoading && !project) {
    return <AdminLoadingState />;
  }

  if (projectQuery.isError || !project) {
    return (
      <AdminErrorState
        title={t`Project unavailable`}
        description={t`We could not load this Program B project right now.`}
        actionLabel={t`Retry`}
        onAction={() => void projectQuery.refetch()}
      />
    );
  }

  let milestonesContent;

  if (milestonesQuery.isError) {
    milestonesContent = (
      <p className="text-sm text-slate-600">{t`Milestones are unavailable right now.`}</p>
    );
  } else if (milestones.length === 0) {
    milestonesContent = <p className="text-sm text-slate-600">{t`No milestones yet.`}</p>;
  } else {
    milestonesContent = milestones.map((milestone) => (
      <div key={milestone.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-slate-950">{milestone.title}</p>
          <span className="text-xs text-slate-500">{formatEnumLabel(milestone.status)}</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {normalizeUnknownText(milestone.description) ?? t`No description.`}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {milestone.dueAt ? t`Due ${formatUnknownDate(milestone.dueAt)}` : t`No due date`}
        </p>
      </div>
    ));
  }

  let reviewsContent;

  if (reviewsQuery.isError) {
    reviewsContent = (
      <p className="text-sm text-slate-600">{t`Reviews are unavailable right now.`}</p>
    );
  } else if (reviews.length === 0) {
    reviewsContent = <p className="text-sm text-slate-600">{t`No reviews yet.`}</p>;
  } else {
    reviewsContent = reviews.map((review) => (
      <div key={review.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-medium text-slate-950">{formatEnumLabel(review.decision)}</p>
        <p className="mt-1 text-sm text-slate-600">
          {normalizeUnknownText(review.comment) ?? t`No comment`}
        </p>
      </div>
    ));
  }

  let notesContent;

  if (notesQuery.isError) {
    notesContent = <p className="text-sm text-slate-600">{t`Notes are unavailable right now.`}</p>;
  } else if (notes.length === 0) {
    notesContent = <p className="text-sm text-slate-600">{t`No mentoring notes yet.`}</p>;
  } else {
    notesContent = notes.map((note) => (
      <div key={note.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">{note.note}</p>
        <p className="mt-2 text-xs text-slate-500">
          {formatPersonName(note.author) ?? t`Mentor`} · {formatAdminDateTime(note.createdAt)}
        </p>
      </div>
    ));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
              {t`Program B project`}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              {normalizeUnknownText(project.backlogItem.title) ?? t`Program B project`}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {formatEnumLabel(project.status)} · {project.team.name ?? t`Unknown team`}
            </p>
          </div>
          <Link href={ROUTES.ADMIN.PROGRAM_B_PROJECTS} className="text-sm font-medium text-sky-700">
            {t`Back to projects`}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">{t`Mentor assignment`}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {t`Current mentor:`}{' '}
            <span className="font-medium text-slate-900">
              {formatPersonName(project.mentorAssignment.mentor) ?? t`Not assigned`}
            </span>
          </p>
          {isProjectReadOnly ? (
            <p className="mt-3 text-sm text-slate-500">
              {t`This project is closed and now read-only.`}
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                className="min-w-56 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={selectedMentorId}
                disabled={mentorsQuery.isLoading}
                onChange={(event) => setSelectedMentorId(event.target.value)}
              >
                <option value="">
                  {mentorsQuery.isLoading ? t`Loading mentors…` : t`Select a mentor`}
                </option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.firstName} {mentor.lastName} · {mentor.email}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                disabled={!selectedMentorId || assignMentor.isPending}
                onClick={() => void handleAssignMentor()}
              >
                {assignMentor.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t`Assign mentor`}
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">{t`Final acceptance`}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {t`Company:`}{' '}
            <span className="font-medium text-slate-900">
              {project.acceptedByCompanyAt
                ? formatAdminDateTime(project.acceptedByCompanyAt)
                : t`Pending`}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t`NTI:`}{' '}
            <span className="font-medium text-slate-900">
              {hasNtiFinalAcceptance ? formatAdminDateTime(project.acceptedByNtiAt) : t`Pending`}
            </span>
          </p>
          {!hasNtiFinalAcceptance && !isProjectReadOnly ? (
            <div className="mt-4">
              <Button
                type="button"
                size="sm"
                disabled={recordFinalAcceptance.isPending}
                onClick={() => void handleNtiAcceptance()}
              >
                {recordFinalAcceptance.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t`Record NTI final acceptance`}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">{t`Reward per member`}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {t`Current reward:`}{' '}
            <span className="font-medium text-slate-900">
              {typeof (project.rewardPerMember as unknown) === 'number'
                ? `€${(project.rewardPerMember as unknown as number).toLocaleString()}`
                : t`Not set`}
            </span>
          </p>
          {isProjectReadOnly ? (
            <p className="mt-3 text-sm text-slate-500">
              {t`This project is closed and now read-only.`}
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <Label htmlFor="admin-reward-input">{t`Amount (EUR)`}</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="admin-reward-input"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 500"
                  className="w-40"
                  value={rewardInput}
                  onChange={(event) => setRewardInput(event.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!rewardInput.trim() || updateReward.isPending}
                  onClick={() => void handleUpdateReward()}
                >
                  {updateReward.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t`Set reward`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">{t`Milestones`}</TabsTrigger>
          <TabsTrigger value="reviews">{t`Reviews & notes`}</TabsTrigger>
          <TabsTrigger value="documents">{t`Documents`}</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">{t`Milestones`}</h2>
            <div className="mt-4 space-y-3">{milestonesContent}</div>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">{t`Product owner reviews`}</h2>
              <div className="mt-4 space-y-3">{reviewsContent}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">{t`Mentoring notes`}</h2>
              <div className="mt-4 space-y-3">{notesContent}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">{t`Documents`}</h2>
            <div className="mt-4">
              <ProgramBDocumentManager
                documents={documents}
                categories={[]}
                isLoading={documentsQuery.isLoading && !documentsQuery.data}
                isError={documentsQuery.isError}
                canUpload={false}
                createUpload={() =>
                  Promise.reject(new Error('Admins cannot upload project documents.'))
                }
                completeUpload={() => Promise.resolve(undefined)}
                requestDownload={(documentId) =>
                  programBProjectsControllerRequestDocumentDownload(id, documentId)
                }
                onChanged={refreshWorkspace}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
