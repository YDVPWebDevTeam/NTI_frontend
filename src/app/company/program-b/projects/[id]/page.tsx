'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

import {
  CreateProgramBFinalAcceptanceDtoSide,
  CreateProgramBPoReviewDtoDecision,
  CreateProgramBProjectDocumentUploadDtoCategory,
  programBProjectsControllerRequestDocumentDownload,
  ProgramBMilestoneDtoStatus,
  ProgramBProjectDetailDtoStatus,
  useProgramBProjectsControllerCompleteDocumentUpload,
  useProgramBProjectsControllerCreateDocumentUpload,
  useProgramBProjectsControllerCreateMilestone,
  useProgramBProjectsControllerCreatePoReview,
  useProgramBProjectsControllerGetProject,
  useProgramBProjectsControllerListDocuments,
  useProgramBProjectsControllerListMentoringNotes,
  useProgramBProjectsControllerListMilestones,
  useProgramBProjectsControllerListPoReviews,
  useProgramBProjectsControllerRecordFinalAcceptance,
  useProgramBProjectsControllerUpdateMilestone,
  useProgramBProjectsControllerUpdateReward,
} from 'lib/api';
import { invalidateProgramBCompanyWorkspace } from 'lib/api-client/program-b-company';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import {
  CompanyDashboardStatus,
  CompanyStatusBadge,
} from 'components/company-dashboard/program-b-company-dashboard-primitives';
import { ProgramBDocumentManager } from 'components/company-dashboard/program-b-document-manager';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import {
  formatPersonName,
  formatUnknownDate,
  normalizeUnknownDate,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { formatEnumLabel } from 'lib/utils';

const CONFLICT_STATUS = 409;
const ISO_DATE_LENGTH = 10;

type MilestoneFormState = {
  milestoneId: string | null;
  title: string;
  description: string;
  dueAt: string;
};

const EMPTY_MILESTONE_FORM: MilestoneFormState = {
  milestoneId: null,
  title: '',
  description: '',
  dueAt: '',
};

const PROJECT_DOCUMENT_CATEGORIES = [
  { value: CreateProgramBProjectDocumentUploadDtoCategory.OUTPUT, label: t`Output` },
  {
    value: CreateProgramBProjectDocumentUploadDtoCategory.FINAL_PRESENTATION,
    label: t`Final presentation`,
  },
  { value: CreateProgramBProjectDocumentUploadDtoCategory.DELIVERABLE, label: t`Deliverable` },
  { value: CreateProgramBProjectDocumentUploadDtoCategory.OTHER, label: t`Other` },
];

function toDateInputValue(value: unknown): string {
  const normalized = normalizeUnknownDate(value);

  if (!normalized) {
    return '';
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, ISO_DATE_LENGTH);
}

export default function CompanyProgramBProjectDetailPage({
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
  const recordFinalAcceptance = useProgramBProjectsControllerRecordFinalAcceptance();
  const updateMilestone = useProgramBProjectsControllerUpdateMilestone();
  const createMilestone = useProgramBProjectsControllerCreateMilestone();
  const createPoReview = useProgramBProjectsControllerCreatePoReview();
  const createDocumentUpload = useProgramBProjectsControllerCreateDocumentUpload();
  const completeDocumentUpload = useProgramBProjectsControllerCompleteDocumentUpload();

  const project = projectQuery.data;
  const milestones = milestonesQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const documents = documentsQuery.data ?? [];
  const isProjectReadOnly = project?.status === ProgramBProjectDetailDtoStatus.CLOSED;
  const hasCompanyFinalAcceptance = Boolean(project?.acceptedByCompanyAt);
  const hasNtiFinalAcceptance = Boolean(project?.acceptedByNtiAt);
  const hasOverdueMilestone = milestones.some((milestone) => {
    const normalizedDueAt = normalizeUnknownDate(milestone.dueAt);

    if (!normalizedDueAt) {
      return false;
    }

    return (
      new Date(normalizedDueAt).getTime() < Date.now() &&
      milestone.status !== ProgramBMilestoneDtoStatus.DONE
    );
  });

  const [milestoneForm, setMilestoneForm] = useState<MilestoneFormState>(EMPTY_MILESTONE_FORM);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<CreateProgramBPoReviewDtoDecision>(
    CreateProgramBPoReviewDtoDecision.APPROVED,
  );
  const [reviewComment, setReviewComment] = useState('');
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

  const handleUpdateReward = async () => {
    const parsed = parseFloat(rewardInput.trim());

    if (!rewardInput.trim() || Number.isNaN(parsed) || parsed < 0) {
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

  const handleFinalAcceptance = async () => {
    try {
      await recordFinalAcceptance.mutateAsync({
        id,
        data: { side: CreateProgramBFinalAcceptanceDtoSide.COMPANY },
      });
      toast.success(t`Final acceptance recorded.`);
      await refreshWorkspace();
    } catch (error) {
      reportMutationError(error, t`Unable to record final acceptance.`);
    }
  };

  const handleMilestoneStatus = async (
    milestoneId: string,
    nextStatus: (typeof ProgramBMilestoneDtoStatus)[keyof typeof ProgramBMilestoneDtoStatus],
  ) => {
    try {
      await updateMilestone.mutateAsync({ id, milestoneId, data: { status: nextStatus } });
      toast.success(t`Milestone updated.`);
      await refreshWorkspace();
    } catch (error) {
      reportMutationError(error, t`Unable to update milestone.`);
    }
  };

  const handleMilestoneSubmit = async () => {
    if (!milestoneForm.title.trim()) {
      toast.error(t`Milestone title is required.`);

      return;
    }

    const data = {
      title: milestoneForm.title.trim(),
      description: milestoneForm.description.trim() || undefined,
      dueAt: milestoneForm.dueAt ? new Date(milestoneForm.dueAt).toISOString() : undefined,
    };

    try {
      if (milestoneForm.milestoneId) {
        await updateMilestone.mutateAsync({
          id,
          milestoneId: milestoneForm.milestoneId,
          data,
        });
        toast.success(t`Milestone updated.`);
      } else {
        await createMilestone.mutateAsync({ id, data });
        toast.success(t`Milestone created.`);
      }
      setIsMilestoneOpen(false);
      setMilestoneForm(EMPTY_MILESTONE_FORM);
      await refreshWorkspace();
    } catch (error) {
      reportMutationError(error, t`Unable to save milestone.`);
    }
  };

  const handleCreateReview = async () => {
    try {
      await createPoReview.mutateAsync({
        id,
        data: {
          decision: reviewDecision,
          comment: reviewComment.trim() || undefined,
        },
      });
      toast.success(t`Review submitted.`);
      setReviewComment('');
      setReviewDecision(CreateProgramBPoReviewDtoDecision.APPROVED);
      await refreshWorkspace();
    } catch (error) {
      reportMutationError(error, t`Unable to submit review.`);
    }
  };

  const openCreateMilestone = () => {
    setMilestoneForm(EMPTY_MILESTONE_FORM);
    setIsMilestoneOpen(true);
  };

  const openEditMilestone = (milestone: (typeof milestones)[number]) => {
    setMilestoneForm({
      milestoneId: milestone.id,
      title: milestone.title,
      description: normalizeUnknownText(milestone.description) ?? '',
      dueAt: toDateInputValue(milestone.dueAt),
    });
    setIsMilestoneOpen(true);
  };

  if (projectQuery.isLoading && !project) {
    return (
      <CompanyDashboardStatus
        title={t`Loading project`}
        description={t`Resolving the Program B project detail for this organization.`}
      />
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <CompanyDashboardStatus
        title={t`Project is unavailable`}
        description={t`We could not load this Program B project right now.`}
        tone="danger"
      />
    );
  }

  const isMilestonePending = createMilestone.isPending || updateMilestone.isPending;

  let milestonesContent;

  if (milestonesQuery.isError) {
    milestonesContent = (
      <p className="text-sm text-[#60718d]">{t`Milestones are unavailable right now.`}</p>
    );
  } else if (milestones.length === 0) {
    milestonesContent = <p className="text-sm text-[#60718d]">{t`No milestones yet.`}</p>;
  } else {
    milestonesContent = milestones.map((milestone) => (
      <div key={milestone.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#10213d]">{milestone.title}</p>
            <p className="mt-1 text-sm text-[#60718d]">
              {normalizeUnknownText(milestone.description) ?? t`No milestone description.`}
            </p>
          </div>
          <CompanyStatusBadge status={milestone.status} />
        </div>
        <p className="mt-3 text-sm text-[#60718d]">
          {milestone.dueAt ? t`Due ${formatUnknownDate(milestone.dueAt)}` : t`No due date`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isProjectReadOnly}
            onClick={() => openEditMilestone(milestone)}
          >
            {t`Edit`}
          </Button>
          {milestone.status === ProgramBMilestoneDtoStatus.IN_PROGRESS ? null : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isProjectReadOnly || updateMilestone.isPending}
              onClick={() =>
                void handleMilestoneStatus(milestone.id, ProgramBMilestoneDtoStatus.IN_PROGRESS)
              }
            >
              {t`Mark in progress`}
            </Button>
          )}
          {milestone.status === ProgramBMilestoneDtoStatus.DONE ? null : (
            <Button
              type="button"
              size="sm"
              disabled={isProjectReadOnly || updateMilestone.isPending}
              onClick={() =>
                void handleMilestoneStatus(milestone.id, ProgramBMilestoneDtoStatus.DONE)
              }
            >
              {t`Mark done`}
            </Button>
          )}
          {milestone.status === ProgramBMilestoneDtoStatus.BLOCKED ? null : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isProjectReadOnly || updateMilestone.isPending}
              onClick={() =>
                void handleMilestoneStatus(milestone.id, ProgramBMilestoneDtoStatus.BLOCKED)
              }
            >
              {t`Mark blocked`}
            </Button>
          )}
        </div>
      </div>
    ));
  }

  let reviewsContent;

  if (reviewsQuery.isError) {
    reviewsContent = (
      <p className="text-sm text-[#60718d]">{t`Reviews are unavailable right now.`}</p>
    );
  } else if (reviews.length === 0) {
    reviewsContent = <p className="text-sm text-[#60718d]">{t`No reviews yet.`}</p>;
  } else {
    reviewsContent = reviews.map((review) => (
      <div key={review.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-[#10213d]">{formatEnumLabel(review.decision)}</p>
          <span className="text-xs text-[#60718d]">{formatUnknownDate(review.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm text-[#60718d]">
          {normalizeUnknownText(review.comment) ?? t`No comment`}
        </p>
        {formatPersonName(review.author) ? (
          <p className="mt-2 text-xs text-[#94a3c4]">{formatPersonName(review.author)}</p>
        ) : null}
      </div>
    ));
  }

  let notesContent;

  if (notesQuery.isError) {
    notesContent = <p className="text-sm text-[#60718d]">{t`Notes are unavailable right now.`}</p>;
  } else if (notes.length === 0) {
    notesContent = <p className="text-sm text-[#60718d]">{t`No mentoring notes yet.`}</p>;
  } else {
    notesContent = notes.map((note) => (
      <div key={note.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <p className="text-sm leading-7 text-[#60718d]">{note.note}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#94a3c4]">
          <span>{formatPersonName(note.author) ?? t`Mentor`}</span>
          <span>{formatUnknownDate(note.createdAt)}</span>
        </div>
      </div>
    ));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#10213d]">
                {normalizeUnknownText(project.backlogItem.title) ?? t`Program B project`}
              </h1>
              <CompanyStatusBadge status={project.status} />
              {isProjectReadOnly ? (
                <span className="rounded-full bg-[#10213d] px-3 py-1 text-xs font-semibold text-white">
                  {t`Closed Program B projects are read-only`}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-[#60718d]">
              {isProjectReadOnly
                ? t`This project is closed and now read-only.`
                : formatEnumLabel(project.status)}
            </p>
          </div>
          <Link
            href={ROUTES.COMPANY.PROGRAM_B_PROJECTS}
            className="text-sm font-medium text-[#1e58d5]"
          >
            {t`Back to projects`}
          </Link>
        </div>
      </section>

      {hasCompanyFinalAcceptance && !hasOverdueMilestone ? null : (
        <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-amber-950">{t`Attention required`}</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-amber-900">
            {hasCompanyFinalAcceptance ? null : (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                {t`Company final acceptance is still pending.`}
              </span>
            )}
            {hasOverdueMilestone ? (
              <span className="rounded-full bg-white px-3 py-1 ring-1 ring-amber-200">
                {t`At least one milestone is overdue and still needs status movement.`}
              </span>
            ) : null}
          </div>
          {hasCompanyFinalAcceptance ? null : (
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => void handleFinalAcceptance()}
                disabled={isProjectReadOnly || recordFinalAcceptance.isPending}
              >
                {recordFinalAcceptance.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t`Record company final acceptance`}
              </Button>
            </div>
          )}
        </article>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t`Overview`}</TabsTrigger>
          <TabsTrigger value="milestones">{t`Milestones`}</TabsTrigger>
          <TabsTrigger value="reviews">{t`Reviews & notes`}</TabsTrigger>
          <TabsTrigger value="documents">{t`Documents`}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Overview`}</h2>
            <div className="mt-4 grid gap-2 text-sm text-[#60718d] md:grid-cols-2">
              <p>
                {t`Team:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {project.team.name ?? t`Unknown team`}
                </span>
              </p>
              <p>
                {t`Product owner:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {formatPersonName(project.productOwner)}
                </span>
              </p>
              <p>
                {t`Mentor:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {formatPersonName(project.mentorAssignment.mentor) ?? t`Not assigned`}
                </span>
              </p>
              <p>
                {t`Reward per member:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {typeof (project.rewardPerMember as unknown) === 'number'
                    ? `€${(project.rewardPerMember as unknown as number).toLocaleString()}`
                    : t`Not set`}
                </span>
              </p>
              <p>
                {t`Company acceptance:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {hasCompanyFinalAcceptance
                    ? formatUnknownDate(project.acceptedByCompanyAt)
                    : t`Pending`}
                </span>
              </p>
              <p>
                {t`NTI acceptance:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {hasNtiFinalAcceptance ? formatUnknownDate(project.acceptedByNtiAt) : t`Pending`}
                </span>
              </p>
            </div>

            {isProjectReadOnly ? null : (
              <div className="mt-5 space-y-2 border-t border-[#dfe7fa] pt-4">
                <p className="text-sm font-semibold text-[#10213d]">{t`Update reward per member`}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
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
                    {t`Set reward (EUR)`}
                  </Button>
                </div>
              </div>
            )}
          </article>
        </TabsContent>

        <TabsContent value="milestones">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#10213d]">{t`Milestones`}</h2>
              <Button
                type="button"
                size="sm"
                disabled={isProjectReadOnly}
                onClick={openCreateMilestone}
              >
                {t`New milestone`}
              </Button>
            </div>
            <div className="mt-4 space-y-3">{milestonesContent}</div>
          </article>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#10213d]">{t`Product owner reviews`}</h2>
              <div className="mt-4 space-y-3">{reviewsContent}</div>

              {isProjectReadOnly ? null : (
                <div className="mt-5 space-y-3 rounded-2xl border border-dashed border-[#c4d4f5] bg-white/70 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="review-decision">{t`Decision`}</Label>
                    <select
                      id="review-decision"
                      className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
                      value={reviewDecision}
                      onChange={(event) =>
                        setReviewDecision(event.target.value as CreateProgramBPoReviewDtoDecision)
                      }
                    >
                      <option value={CreateProgramBPoReviewDtoDecision.APPROVED}>
                        {t`Approved`}
                      </option>
                      <option value={CreateProgramBPoReviewDtoDecision.CHANGES_REQUESTED}>
                        {t`Changes requested`}
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-comment">{t`Comment (optional)`}</Label>
                    <Textarea
                      id="review-comment"
                      rows={3}
                      maxLength={5000}
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      disabled={createPoReview.isPending}
                      onClick={() => void handleCreateReview()}
                    >
                      {createPoReview.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {t`Submit review`}
                    </Button>
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#10213d]">{t`Mentoring notes`}</h2>
              <div className="mt-4 space-y-3">{notesContent}</div>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Documents`}</h2>
            <div className="mt-4">
              <ProgramBDocumentManager
                documents={documents}
                categories={PROJECT_DOCUMENT_CATEGORIES}
                isLoading={documentsQuery.isLoading && !documentsQuery.data}
                isError={documentsQuery.isError}
                canUpload={!isProjectReadOnly}
                disabled={isProjectReadOnly}
                createUpload={(input) =>
                  createDocumentUpload.mutateAsync({
                    id,
                    data: {
                      ...input,
                      category: input.category as CreateProgramBProjectDocumentUploadDtoCategory,
                    },
                  })
                }
                completeUpload={(documentId, input) =>
                  completeDocumentUpload.mutateAsync({ id, documentId, data: input })
                }
                requestDownload={(documentId) =>
                  programBProjectsControllerRequestDocumentDownload(id, documentId)
                }
                onChanged={refreshWorkspace}
              />
            </div>
          </article>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isMilestoneOpen}
        onOpenChange={(open) => {
          setIsMilestoneOpen(open);
          if (!open) {
            setMilestoneForm(EMPTY_MILESTONE_FORM);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {milestoneForm.milestoneId ? t`Edit milestone` : t`New milestone`}
            </DialogTitle>
            <DialogDescription>
              {t`Capture delivery milestones with an optional description and due date.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">{t`Title`}</Label>
              <Input
                id="milestone-title"
                value={milestoneForm.title}
                onChange={(event) =>
                  setMilestoneForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-description">{t`Description`}</Label>
              <Textarea
                id="milestone-description"
                rows={3}
                value={milestoneForm.description}
                onChange={(event) =>
                  setMilestoneForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-due">{t`Due date`}</Label>
              <Input
                id="milestone-due"
                type="date"
                value={milestoneForm.dueAt}
                onChange={(event) =>
                  setMilestoneForm((current) => ({ ...current, dueAt: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsMilestoneOpen(false)}>
              {t`Cancel`}
            </Button>
            <Button
              type="button"
              disabled={isMilestonePending}
              onClick={() => void handleMilestoneSubmit()}
            >
              {isMilestonePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {milestoneForm.milestoneId ? t`Save changes` : t`Create milestone`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
