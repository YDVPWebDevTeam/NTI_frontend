'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

import {
  programBProjectsControllerRequestDocumentDownload,
  ProgramBMilestoneDtoStatus,
  ProgramBProjectDetailDtoStatus,
  useProgramBProjectsControllerCreateMentoringNote,
  useProgramBProjectsControllerCreateMilestone,
  useProgramBProjectsControllerGetProject,
  useProgramBProjectsControllerListDocuments,
  useProgramBProjectsControllerListMentoringNotes,
  useProgramBProjectsControllerListMilestones,
  useProgramBProjectsControllerListPoReviews,
  useProgramBProjectsControllerUpdateMilestone,
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

const FORBIDDEN_STATUS = 403;
const CONFLICT_STATUS = 409;
const ISO_DATE_LENGTH = 10;

type MilestoneStatus = (typeof ProgramBMilestoneDtoStatus)[keyof typeof ProgramBMilestoneDtoStatus];

type MilestoneFormState = {
  title: string;
  description: string;
  dueAt: string;
  status: MilestoneStatus;
};

type EditMilestoneFormState = MilestoneFormState & {
  milestoneId: string;
};

const EMPTY_MILESTONE_FORM: MilestoneFormState = {
  title: '',
  description: '',
  dueAt: '',
  status: ProgramBMilestoneDtoStatus.PLANNED,
};

function toDateInputValue(value: unknown): string {
  const normalizedDate = normalizeUnknownDate(value);

  if (!normalizedDate) {
    return '';
  }

  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, ISO_DATE_LENGTH);
}

function toIsoDate(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

export default function MentorProgramBProjectDetailPage({
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

  const createMentoringNote = useProgramBProjectsControllerCreateMentoringNote();
  const createMilestone = useProgramBProjectsControllerCreateMilestone();
  const updateMilestone = useProgramBProjectsControllerUpdateMilestone();

  const project = projectQuery.data;
  const milestones = milestonesQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const documents = documentsQuery.data ?? [];

  const isProjectReadOnly = project?.status === ProgramBProjectDetailDtoStatus.CLOSED;

  const [noteBody, setNoteBody] = useState('');
  const [createMilestoneForm, setCreateMilestoneForm] =
    useState<MilestoneFormState>(EMPTY_MILESTONE_FORM);
  const [editMilestoneForm, setEditMilestoneForm] = useState<EditMilestoneFormState | null>(null);

  const refreshWorkspace = async () => {
    await invalidateProgramBCompanyWorkspace(queryClient, {
      projectId: id,
    });
  };

  const reportMilestoneError = (error: unknown, fallback: string) => {
    if (isApiRequestError(error) && error.status === FORBIDDEN_STATUS) {
      toast.error(t`You do not have permission to manage milestones for this project.`);

      return;
    }

    if (isApiRequestError(error) && error.status === CONFLICT_STATUS) {
      toast.error(t`Closed Program B projects are read-only.`);

      return;
    }

    toast.error(error instanceof Error ? error.message : fallback);
  };

  const handleCreateNote = async () => {
    if (!noteBody.trim()) {
      toast.error(t`Note cannot be empty.`);

      return;
    }

    try {
      await createMentoringNote.mutateAsync({
        id,
        data: {
          note: noteBody.trim(),
        },
      });

      toast.success(t`Mentoring note added.`);
      setNoteBody('');
      await refreshWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to add mentoring note.`);
    }
  };

  const handleCreateMilestone = async () => {
    const title = createMilestoneForm.title.trim();

    if (!title) {
      toast.error(t`Milestone title is required.`);

      return;
    }

    try {
      await createMilestone.mutateAsync({
        id,
        data: {
          title,
          description: createMilestoneForm.description.trim() || undefined,
          dueAt: toIsoDate(createMilestoneForm.dueAt),
          status: createMilestoneForm.status,
        },
      });

      toast.success(t`Milestone created.`);
      setCreateMilestoneForm(EMPTY_MILESTONE_FORM);
      await refreshWorkspace();
    } catch (error) {
      reportMilestoneError(error, t`Unable to create milestone.`);
    }
  };

  const openEditMilestone = (milestone: (typeof milestones)[number]) => {
    setEditMilestoneForm({
      milestoneId: milestone.id,
      title: milestone.title,
      description: normalizeUnknownText(milestone.description) ?? '',
      dueAt: toDateInputValue(milestone.dueAt),
      status: milestone.status,
    });
  };

  const handleUpdateMilestone = async () => {
    if (!editMilestoneForm) {
      return;
    }

    const title = editMilestoneForm.title.trim();

    if (!title) {
      toast.error(t`Milestone title is required.`);

      return;
    }

    try {
      await updateMilestone.mutateAsync({
        id,
        milestoneId: editMilestoneForm.milestoneId,
        data: {
          title,
          description: editMilestoneForm.description.trim(),
          dueAt: editMilestoneForm.dueAt
            ? new Date(editMilestoneForm.dueAt).toISOString()
            : undefined,
          status: editMilestoneForm.status,
        },
      });

      toast.success(t`Milestone updated.`);
      setEditMilestoneForm(null);
      await refreshWorkspace();
    } catch (error) {
      reportMilestoneError(error, t`Unable to update milestone.`);
    }
  };

  if (projectQuery.isLoading && !project) {
    return (
      <CompanyDashboardStatus
        title={t`Loading project`}
        description={t`Resolving the Program B project detail.`}
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

  const isMilestoneMutationPending = createMilestone.isPending || updateMilestone.isPending;

  let milestonesContent;

  if (milestonesQuery.isLoading && !milestonesQuery.data) {
    milestonesContent = (
      <div className="flex items-center gap-2 text-sm text-[#60718d]">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t`Loading milestones`}</span>
      </div>
    );
  } else if (milestonesQuery.isError) {
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

        {isProjectReadOnly ? null : (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={updateMilestone.isPending}
              onClick={() => openEditMilestone(milestone)}
            >
              {t`Edit`}
            </Button>
          </div>
        )}
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
            </div>

            <p className="mt-3 text-sm text-[#60718d]">
              {t`Team:`} {project.team.name ?? t`Unknown team`}
            </p>
          </div>

          <Link
            href={ROUTES.MENTOR.PROGRAM_B_PROJECTS}
            className="text-sm font-medium text-[#1e58d5]"
          >
            {t`Back to projects`}
          </Link>
        </div>
      </section>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t`Overview`}</TabsTrigger>
          <TabsTrigger value="milestones">{t`Milestones`}</TabsTrigger>
          <TabsTrigger value="notes">{t`Notes & reviews`}</TabsTrigger>
          <TabsTrigger value="documents">{t`Documents`}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Overview`}</h2>

            <div className="mt-4 grid gap-2 text-sm text-[#60718d] md:grid-cols-2">
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
            </div>
          </article>
        </TabsContent>

        <TabsContent value="milestones">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Milestones`}</h2>

            <div className="mt-4 space-y-3">{milestonesContent}</div>

            {isProjectReadOnly ? (
              <p className="mt-5 rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4 text-sm text-[#60718d]">
                {t`Closed Program B projects are read-only.`}
              </p>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[#c4d4f5] bg-white/70 p-4">
                <div>
                  <h3 className="font-semibold text-[#10213d]">{t`Create milestone`}</h3>

                  <p className="mt-1 text-sm text-[#60718d]">
                    {t`Add a new delivery milestone to this project.`}
                  </p>
                </div>

                <div className="mt-4 grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-milestone-title">{t`Title`}</Label>

                    <Input
                      id="create-milestone-title"
                      maxLength={255}
                      value={createMilestoneForm.title}
                      onChange={(event) =>
                        setCreateMilestoneForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-milestone-description">{t`Description`}</Label>

                    <Textarea
                      id="create-milestone-description"
                      rows={3}
                      maxLength={2000}
                      value={createMilestoneForm.description}
                      onChange={(event) =>
                        setCreateMilestoneForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="create-milestone-due-date">{t`Due date`}</Label>

                      <Input
                        id="create-milestone-due-date"
                        type="date"
                        value={createMilestoneForm.dueAt}
                        onChange={(event) =>
                          setCreateMilestoneForm((current) => ({
                            ...current,
                            dueAt: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-milestone-status">{t`Status`}</Label>

                      <select
                        id="create-milestone-status"
                        className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm"
                        value={createMilestoneForm.status}
                        onChange={(event) =>
                          setCreateMilestoneForm((current) => ({
                            ...current,
                            status: event.target.value as MilestoneStatus,
                          }))
                        }
                      >
                        <option value={ProgramBMilestoneDtoStatus.PLANNED}>{t`Planned`}</option>
                        <option value={ProgramBMilestoneDtoStatus.IN_PROGRESS}>
                          {t`In progress`}
                        </option>
                        <option value={ProgramBMilestoneDtoStatus.DONE}>{t`Done`}</option>
                        <option value={ProgramBMilestoneDtoStatus.BLOCKED}>{t`Blocked`}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      disabled={createMilestone.isPending || !createMilestoneForm.title.trim()}
                      onClick={() => void handleCreateMilestone()}
                    >
                      {createMilestone.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}

                      {t`Create milestone`}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </article>
        </TabsContent>

        <TabsContent value="notes">
          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#10213d]">{t`Mentoring notes`}</h2>

              <div className="mt-4 space-y-3">{notesContent}</div>

              {isProjectReadOnly ? null : (
                <div className="mt-5 space-y-3 rounded-2xl border border-dashed border-[#c4d4f5] bg-white/70 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="mentoring-note">{t`Add a mentoring note`}</Label>

                    <Textarea
                      id="mentoring-note"
                      rows={4}
                      maxLength={5000}
                      value={noteBody}
                      onChange={(event) => setNoteBody(event.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      disabled={createMentoringNote.isPending}
                      onClick={() => void handleCreateNote()}
                    >
                      {createMentoringNote.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}

                      {t`Add note`}
                    </Button>
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#10213d]">{t`Product owner reviews`}</h2>

              <div className="mt-4 space-y-3">{reviewsContent}</div>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Documents`}</h2>

            <div className="mt-4">
              <ProgramBDocumentManager
                documents={documents}
                categories={[]}
                isLoading={documentsQuery.isLoading && !documentsQuery.data}
                isError={documentsQuery.isError}
                canUpload={false}
                createUpload={() =>
                  Promise.reject(new Error('Mentors cannot upload project documents.'))
                }
                completeUpload={() => Promise.resolve(undefined)}
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
        open={Boolean(editMilestoneForm)}
        onOpenChange={(open) => {
          if (!open) {
            setEditMilestoneForm(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t`Edit milestone`}</DialogTitle>

            <DialogDescription>
              {t`Update the milestone title, description, due date, or status.`}
            </DialogDescription>
          </DialogHeader>

          {editMilestoneForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-milestone-title">{t`Title`}</Label>

                <Input
                  id="edit-milestone-title"
                  maxLength={255}
                  value={editMilestoneForm.title}
                  onChange={(event) =>
                    setEditMilestoneForm((current) =>
                      current
                        ? {
                            ...current,
                            title: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-milestone-description">{t`Description`}</Label>

                <Textarea
                  id="edit-milestone-description"
                  rows={3}
                  maxLength={2000}
                  value={editMilestoneForm.description}
                  onChange={(event) =>
                    setEditMilestoneForm((current) =>
                      current
                        ? {
                            ...current,
                            description: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-milestone-due-date">{t`Due date`}</Label>

                <Input
                  id="edit-milestone-due-date"
                  type="date"
                  value={editMilestoneForm.dueAt}
                  onChange={(event) =>
                    setEditMilestoneForm((current) =>
                      current
                        ? {
                            ...current,
                            dueAt: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-milestone-status">{t`Status`}</Label>

                <select
                  id="edit-milestone-status"
                  className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm"
                  value={editMilestoneForm.status}
                  onChange={(event) =>
                    setEditMilestoneForm((current) =>
                      current
                        ? {
                            ...current,
                            status: event.target.value as MilestoneStatus,
                          }
                        : current,
                    )
                  }
                >
                  <option value={ProgramBMilestoneDtoStatus.PLANNED}>{t`Planned`}</option>
                  <option value={ProgramBMilestoneDtoStatus.IN_PROGRESS}>{t`In progress`}</option>
                  <option value={ProgramBMilestoneDtoStatus.DONE}>{t`Done`}</option>
                  <option value={ProgramBMilestoneDtoStatus.BLOCKED}>{t`Blocked`}</option>
                </select>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isMilestoneMutationPending}
              onClick={() => setEditMilestoneForm(null)}
            >
              {t`Cancel`}
            </Button>

            <Button
              type="button"
              disabled={isMilestoneMutationPending || !editMilestoneForm?.title.trim()}
              onClick={() => void handleUpdateMilestone()}
            >
              {updateMilestone.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}

              {t`Save changes`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
