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
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
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
  const { me } = useAuthenticatedUser();

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
  const isAssignedMentor = Boolean(me?.id) && me?.id === project?.mentorAssignment?.mentorUserId;
  const canManageMilestones = !isProjectReadOnly && isAssignedMentor;

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
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t`Loading milestones`}</span>
      </div>
    );
  } else if (milestonesQuery.isError) {
    milestonesContent = (
      <p className="text-muted-foreground text-sm">{t`Milestones are unavailable right now.`}</p>
    );
  } else if (milestones.length === 0) {
    milestonesContent = <p className="text-muted-foreground text-sm">{t`No milestones yet.`}</p>;
  } else {
    milestonesContent = milestones.map((milestone) => (
      <div key={milestone.id} className="border-border bg-muted rounded-2xl border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-foreground font-semibold">{milestone.title}</p>

            <p className="text-muted-foreground mt-1 text-sm">
              {normalizeUnknownText(milestone.description) ?? t`No milestone description.`}
            </p>
          </div>

          <CompanyStatusBadge status={milestone.status} />
        </div>

        <p className="text-muted-foreground mt-3 text-sm">
          {milestone.dueAt ? t`Due ${formatUnknownDate(milestone.dueAt)}` : t`No due date`}
        </p>

        {canManageMilestones ? (
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
        ) : null}
      </div>
    ));
  }

  let reviewsContent;

  if (reviewsQuery.isError) {
    reviewsContent = (
      <p className="text-muted-foreground text-sm">{t`Reviews are unavailable right now.`}</p>
    );
  } else if (reviews.length === 0) {
    reviewsContent = <p className="text-muted-foreground text-sm">{t`No reviews yet.`}</p>;
  } else {
    reviewsContent = reviews.map((review) => (
      <div key={review.id} className="border-border bg-muted rounded-2xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-foreground font-semibold">{formatEnumLabel(review.decision)}</p>

          <span className="text-muted-foreground text-xs">
            {formatUnknownDate(review.createdAt)}
          </span>
        </div>

        <p className="text-muted-foreground mt-1 text-sm">
          {normalizeUnknownText(review.comment) ?? t`No comment`}
        </p>
      </div>
    ));
  }

  let notesContent;

  if (notesQuery.isError) {
    notesContent = (
      <p className="text-muted-foreground text-sm">{t`Notes are unavailable right now.`}</p>
    );
  } else if (notes.length === 0) {
    notesContent = <p className="text-muted-foreground text-sm">{t`No mentoring notes yet.`}</p>;
  } else {
    notesContent = notes.map((note) => (
      <div key={note.id} className="border-border bg-muted rounded-2xl border p-4">
        <p className="text-muted-foreground text-sm leading-7">{note.note}</p>

        <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>{formatPersonName(note.author) ?? t`Mentor`}</span>
          <span>{formatUnknownDate(note.createdAt)}</span>
        </div>
      </div>
    ));
  }

  return (
    <div className="space-y-6">
      <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-semibold">
                {normalizeUnknownText(project.backlogItem.title) ?? t`Program B project`}
              </h1>

              <CompanyStatusBadge status={project.status} />
            </div>

            <p className="text-muted-foreground mt-3 text-sm">
              {t`Team:`} {project.team.name ?? t`Unknown team`}
            </p>
          </div>

          <Link
            href={ROUTES.MENTOR.PROGRAM_B_PROJECTS}
            className="text-primary text-sm font-medium"
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
          <article className="border-border bg-card rounded-2xl border p-5 shadow-sm">
            <h2 className="text-foreground text-lg font-semibold">{t`Overview`}</h2>

            <div className="text-muted-foreground mt-4 grid gap-2 text-sm md:grid-cols-2">
              <p>
                {t`Product owner:`}{' '}
                <span className="text-foreground font-medium">
                  {formatPersonName(project.productOwner)}
                </span>
              </p>

              <p>
                {t`Mentor:`}{' '}
                <span className="text-foreground font-medium">
                  {formatPersonName(project.mentorAssignment.mentor) ?? t`Not assigned`}
                </span>
              </p>
            </div>
          </article>
        </TabsContent>

        <TabsContent value="milestones">
          <article className="border-border bg-card rounded-2xl border p-5 shadow-sm">
            <h2 className="text-foreground text-lg font-semibold">{t`Milestones`}</h2>

            <div className="mt-4 space-y-3">{milestonesContent}</div>

            {isProjectReadOnly && (
              <p className="border-border bg-muted text-muted-foreground mt-5 rounded-2xl border p-4 text-sm">
                {t`Closed Program B projects are read-only.`}
              </p>
            )}
            {!isProjectReadOnly && !isAssignedMentor && (
              <p className="border-border bg-muted text-muted-foreground mt-5 rounded-2xl border p-4 text-sm">
                {t`Only the mentor assigned to this project can create or edit milestones.`}
              </p>
            )}
            {!isProjectReadOnly && isAssignedMentor && (
              <div className="border-border bg-card/70 mt-6 rounded-2xl border border-dashed p-4">
                <div>
                  <h3 className="text-foreground font-semibold">{t`Create milestone`}</h3>

                  <p className="text-muted-foreground mt-1 text-sm">
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
                        className="border-border bg-card h-10 w-full rounded-md border px-3 text-sm"
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
            <article className="border-border bg-card rounded-2xl border p-5 shadow-sm">
              <h2 className="text-foreground text-lg font-semibold">{t`Mentoring notes`}</h2>

              <div className="mt-4 space-y-3">{notesContent}</div>

              {isProjectReadOnly ? null : (
                <div className="border-border bg-card/70 mt-5 space-y-3 rounded-2xl border border-dashed p-4">
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

            <article className="border-border bg-card rounded-2xl border p-5 shadow-sm">
              <h2 className="text-foreground text-lg font-semibold">{t`Product owner reviews`}</h2>

              <div className="mt-4 space-y-3">{reviewsContent}</div>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <article className="border-border bg-card rounded-2xl border p-5 shadow-sm">
            <h2 className="text-foreground text-lg font-semibold">{t`Documents`}</h2>

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
                  className="border-border bg-card h-10 w-full rounded-md border px-3 text-sm"
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
