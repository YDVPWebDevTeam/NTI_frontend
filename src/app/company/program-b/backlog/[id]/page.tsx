'use client';

import { t } from '@lingui/core/macro';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

import {
  CreateProgramBBacklogDocumentUploadDtoCategory,
  programBBacklogControllerListMy,
  programBBacklogControllerRequestDocumentDownload,
  ProgramBBacklogItemDtoStatus,
  ProgramBTeamApplicationResponseDtoStatus,
  UserRole,
  useOrganizationControllerGetMyOrganization,
  useOrganizationControllerListMembers,
  useProgramBBacklogControllerAcceptCandidate,
  useProgramBBacklogControllerArchive,
  useProgramBBacklogControllerAssignProductOwner,
  useProgramBBacklogControllerCompleteDocumentUpload,
  useProgramBBacklogControllerCreateDocumentUpload,
  useProgramBBacklogControllerCreateProject,
  useProgramBBacklogControllerFindPublishedById,
  useProgramBBacklogControllerListCandidates,
  useProgramBBacklogControllerListDocuments,
  useProgramBBacklogControllerPublish,
  useProgramBBacklogControllerRejectCandidate,
  useProgramBBacklogControllerRemove,
  useProgramBBacklogControllerShortlistCandidate,
  useProgramBBacklogControllerUpdate,
} from 'lib/api';
import {
  getCompanyProgramBBacklogDetailLookupQueryKey,
  invalidateProgramBCompanyWorkspace,
} from 'lib/api-client/program-b-company';
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
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';

const BACKLOG_LOOKUP_PAGE_SIZE = 100;

type CandidateAction = 'shortlist' | 'accept' | 'reject';

const BACKLOG_DOCUMENT_CATEGORIES = [
  {
    value: CreateProgramBBacklogDocumentUploadDtoCategory.TECHNICAL_SPECIFICATION,
    label: t`Technical specification`,
  },
  {
    value: CreateProgramBBacklogDocumentUploadDtoCategory.SUPPORTING,
    label: t`Supporting document`,
  },
  { value: CreateProgramBBacklogDocumentUploadDtoCategory.OTHER, label: t`Other` },
];

export default function CompanyProgramBBacklogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { me } = useAuthenticatedUser();
  const isCompanyOwner = me?.role === UserRole.COMPANY_OWNER;

  const companyBacklogLookupQuery = useQuery({
    queryKey: getCompanyProgramBBacklogDetailLookupQueryKey(id),
    enabled: Boolean(id),
    retry: false,
    queryFn: async () => {
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const response = await programBBacklogControllerListMy({
          page,
          limit: BACKLOG_LOOKUP_PAGE_SIZE,
        });
        const matchingItem = response.data.find((backlogItem) => backlogItem.id === id);

        if (matchingItem) {
          return matchingItem;
        }

        totalPages = response.meta.totalPages;
        page += 1;
      }

      return null;
    },
  });
  const companyBacklogItem = companyBacklogLookupQuery.data ?? null;
  const canLoadCompanyBacklogRelatedData = Boolean(companyBacklogItem);
  const shouldLoadPublishedDetail =
    companyBacklogItem?.status === ProgramBBacklogItemDtoStatus.PUBLISHED;
  const isPublishedDetailUnavailable =
    canLoadCompanyBacklogRelatedData && !shouldLoadPublishedDetail;
  const itemQuery = useProgramBBacklogControllerFindPublishedById(id, {
    query: { enabled: shouldLoadPublishedDetail, retry: false },
  });
  const candidatesQuery = useProgramBBacklogControllerListCandidates(id, {
    query: { enabled: canLoadCompanyBacklogRelatedData, retry: false },
  });
  const documentsQuery = useProgramBBacklogControllerListDocuments(id, {
    query: { enabled: canLoadCompanyBacklogRelatedData, retry: false },
  });

  const organizationQuery = useOrganizationControllerGetMyOrganization({
    query: { retry: false },
  });
  const organizationId = organizationQuery.data?.id;
  const membersQuery = useOrganizationControllerListMembers(organizationId ?? '', {
    query: { enabled: Boolean(organizationId) && isCompanyOwner, retry: false },
  });

  const updateBacklog = useProgramBBacklogControllerUpdate();
  const publishBacklog = useProgramBBacklogControllerPublish();
  const archiveBacklog = useProgramBBacklogControllerArchive();
  const removeBacklog = useProgramBBacklogControllerRemove();
  const assignProductOwner = useProgramBBacklogControllerAssignProductOwner();
  const shortlistCandidate = useProgramBBacklogControllerShortlistCandidate();
  const acceptCandidate = useProgramBBacklogControllerAcceptCandidate();
  const rejectCandidate = useProgramBBacklogControllerRejectCandidate();
  const createProject = useProgramBBacklogControllerCreateProject();
  const createDocumentUpload = useProgramBBacklogControllerCreateDocumentUpload();
  const completeDocumentUpload = useProgramBBacklogControllerCompleteDocumentUpload();

  const item = itemQuery.data ?? companyBacklogItem;
  const candidates = candidatesQuery.data?.data ?? [];
  const documents = documentsQuery.data ?? [];
  const members = membersQuery.data ?? [];

  const status = item?.status;
  const isDraft = status === ProgramBBacklogItemDtoStatus.DRAFT;
  const isArchived = status === ProgramBBacklogItemDtoStatus.ARCHIVED;
  const canEdit = !isArchived;
  const hasPendingCandidateReview = candidates.some(
    (candidate) =>
      candidate.status === ProgramBTeamApplicationResponseDtoStatus.SUBMITTED ||
      candidate.status === ProgramBTeamApplicationResponseDtoStatus.SHORTLISTED,
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editExpectedOutcomes, setEditExpectedOutcomes] = useState('');

  const [isPoOpen, setIsPoOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const [decisionTarget, setDecisionTarget] = useState<{
    applicationId: string;
    action: CandidateAction;
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');

  const openEditDialog = () => {
    if (item) {
      setEditTitle(normalizeUnknownText(item.title) ?? '');
      setEditDescription(normalizeUnknownText(item.description) ?? '');
      setEditBudget(normalizeUnknownText(item.budget) ?? '');
      setEditExpectedOutcomes(normalizeUnknownText(item.expectedOutcomes) ?? '');
    }

    setIsEditOpen(true);
  };

  const refreshWorkspace = async () => {
    await invalidateProgramBCompanyWorkspace(queryClient, { backlogId: id });
  };

  const handleEditSubmit = async () => {
    const trimmedBudget = editBudget.trim();
    const parsedBudget = trimmedBudget === '' ? undefined : Number(trimmedBudget);

    if (parsedBudget != null && (Number.isNaN(parsedBudget) || parsedBudget < 0)) {
      toast.error(t`Budget must be a non-negative number.`);

      return;
    }

    try {
      await updateBacklog.mutateAsync({
        id,
        data: {
          title: editTitle.trim() || undefined,
          description: editDescription.trim() || undefined,
          budget: parsedBudget,
          expectedOutcomes: editExpectedOutcomes.trim() || undefined,
        },
      });
      toast.success(t`Backlog item updated.`);
      setIsEditOpen(false);
      await refreshWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to update backlog item.`);
    }
  };

  const handleLifecycle = async (action: 'publish' | 'archive') => {
    try {
      if (action === 'publish') {
        await publishBacklog.mutateAsync({ id });
        toast.success(t`Backlog item published.`);
      } else {
        await archiveBacklog.mutateAsync({ id });
        toast.success(t`Backlog item archived.`);
      }
      await refreshWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to update backlog status.`);
    }
  };

  const handleDelete = async () => {
    try {
      await removeBacklog.mutateAsync({ id });
      toast.success(t`Backlog item deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to delete backlog item.`);

      return;
    }
    await invalidateProgramBCompanyWorkspace(queryClient, {});
    router.push(ROUTES.COMPANY.PROGRAM_B_BACKLOG);
  };

  const handleAssignProductOwner = async (productOwnerUserId: string) => {
    try {
      await assignProductOwner.mutateAsync({ id, data: { productOwnerUserId } });
      toast.success(t`Product owner assigned.`);
      setIsPoOpen(false);
      setSelectedMemberId('');
      await refreshWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to assign product owner.`);
    }
  };

  const submitCandidateDecision = async () => {
    if (!decisionTarget) {
      return;
    }

    const { applicationId, action } = decisionTarget;
    const data = decisionReason.trim() ? { reason: decisionReason.trim() } : {};

    try {
      if (action === 'shortlist') {
        await shortlistCandidate.mutateAsync({ id, applicationId, data });
        toast.success(t`Candidate shortlisted.`);
      } else if (action === 'accept') {
        await acceptCandidate.mutateAsync({ id, applicationId, data });
        toast.success(t`Candidate accepted.`);
      } else {
        await rejectCandidate.mutateAsync({ id, applicationId, data });
        toast.success(t`Candidate rejected.`);
      }
      setDecisionTarget(null);
      setDecisionReason('');
      await refreshWorkspace();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to update candidate status.`);
    }
  };

  const handleCreateProject = async (applicationId: string) => {
    try {
      const project = await createProject.mutateAsync({ id, applicationId });

      toast.success(t`Project workspace created.`);
      await invalidateProgramBCompanyWorkspace(queryClient, {
        backlogId: id,
        projectId: project.id,
      });
      router.push(ROUTES.COMPANY.programBProjectDetail(project.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to create project.`);
    }
  };

  const isDecisionPending =
    shortlistCandidate.isPending || acceptCandidate.isPending || rejectCandidate.isPending;

  if ((companyBacklogLookupQuery.isLoading || itemQuery.isLoading) && !item) {
    return (
      <CompanyDashboardStatus
        title={t`Loading backlog item`}
        description={t`Resolving the Program B backlog detail for this organization.`}
      />
    );
  }

  if (companyBacklogItem === null || (shouldLoadPublishedDetail && itemQuery.isError) || !item) {
    return (
      <CompanyDashboardStatus
        title={t`Backlog item is unavailable`}
        description={t`We could not load this Program B backlog item right now.`}
        tone="danger"
      />
    );
  }

  let candidatesContent;

  if (candidatesQuery.isLoading && !candidatesQuery.data) {
    candidatesContent = <p className="text-sm text-[#60718d]">{t`Loading candidates…`}</p>;
  } else if (candidatesQuery.isError) {
    candidatesContent = (
      <p className="text-sm text-[#60718d]">{t`Candidates are unavailable right now.`}</p>
    );
  } else if (candidates.length === 0) {
    candidatesContent = <p className="text-sm text-[#60718d]">{t`No candidates yet.`}</p>;
  } else {
    candidatesContent = candidates.map((candidate) => (
      <div key={candidate.id} className="rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[#10213d]">
              {t`Team:`} {candidate.teamId}
            </p>
            <p className="mt-1 text-sm text-[#60718d]">
              {t`Submitted:`} {formatUnknownDate(candidate.submittedAt)}
            </p>
          </div>
          <CompanyStatusBadge status={candidate.status} />
        </div>

        <p className="mt-3 text-sm leading-7 text-[#60718d]">
          {normalizeUnknownText(candidate.motivation) ?? t`No motivation provided.`}
        </p>

        {candidate.decisionReason ? (
          <p className="mt-2 text-sm text-[#60718d]">
            {t`Decision note:`} {candidate.decisionReason}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.status === ProgramBTeamApplicationResponseDtoStatus.SUBMITTED ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isDecisionPending}
              onClick={() => {
                setDecisionReason('');
                setDecisionTarget({ applicationId: candidate.id, action: 'shortlist' });
              }}
            >
              {t`Shortlist`}
            </Button>
          ) : null}

          {candidate.status === ProgramBTeamApplicationResponseDtoStatus.SUBMITTED ||
          candidate.status === ProgramBTeamApplicationResponseDtoStatus.SHORTLISTED ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={isDecisionPending}
                onClick={() => {
                  setDecisionReason('');
                  setDecisionTarget({ applicationId: candidate.id, action: 'accept' });
                }}
              >
                {t`Accept`}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isDecisionPending}
                onClick={() => {
                  setDecisionReason('');
                  setDecisionTarget({ applicationId: candidate.id, action: 'reject' });
                }}
              >
                {t`Reject`}
              </Button>
            </>
          ) : null}

          {candidate.status === ProgramBTeamApplicationResponseDtoStatus.ACCEPTED ? (
            <Button
              type="button"
              size="sm"
              disabled={createProject.isPending}
              onClick={() => void handleCreateProject(candidate.id)}
            >
              {createProject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Create project workspace`}
            </Button>
          ) : null}
        </div>
      </div>
    ));
  }

  let poDialogBody;

  if (membersQuery.isLoading) {
    poDialogBody = <p className="text-sm text-[#60718d]">{t`Loading members…`}</p>;
  } else if (members.length === 0) {
    poDialogBody = <p className="text-sm text-[#60718d]">{t`No organization members found.`}</p>;
  } else {
    poDialogBody = (
      <select
        className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
        value={selectedMemberId}
        onChange={(event) => setSelectedMemberId(event.target.value)}
      >
        <option value="">{t`Select a member`}</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.firstName} {member.lastName} · {member.email}
          </option>
        ))}
      </select>
    );
  }

  let decisionDialogTitle = t`Reject candidate`;

  if (decisionTarget?.action === 'shortlist') {
    decisionDialogTitle = t`Shortlist candidate`;
  } else if (decisionTarget?.action === 'accept') {
    decisionDialogTitle = t`Accept candidate`;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#10213d]">
                {normalizeUnknownText(item.title) ?? t`Program B backlog item`}
              </h1>
              <CompanyStatusBadge status={item.status} />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#60718d]">
              {normalizeUnknownText(item.description) ?? t`No description provided.`}
            </p>
          </div>
          <Link
            href={ROUTES.COMPANY.PROGRAM_B_BACKLOG}
            className="text-sm font-medium text-[#1e58d5]"
          >
            {t`Back to backlog`}
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {canEdit ? (
            <Button type="button" size="sm" variant="outline" onClick={openEditDialog}>
              {t`Edit details`}
            </Button>
          ) : null}
          {isCompanyOwner && isDraft ? (
            <Button
              type="button"
              size="sm"
              disabled={publishBacklog.isPending}
              onClick={() => void handleLifecycle('publish')}
            >
              {publishBacklog.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Publish`}
            </Button>
          ) : null}
          {isCompanyOwner && !isArchived ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={archiveBacklog.isPending}
              onClick={() => void handleLifecycle('archive')}
            >
              {archiveBacklog.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Archive`}
            </Button>
          ) : null}
          {isCompanyOwner && isDraft ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={removeBacklog.isPending}
              onClick={() => void handleDelete()}
            >
              {removeBacklog.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Delete draft`}
            </Button>
          ) : null}
        </div>
      </section>

      {isPublishedDetailUnavailable ? (
        <CompanyDashboardStatus
          title={t`Using organization backlog data`}
          description={t`This backlog item is in an internal company workflow state, so this page is showing the organization-scoped workspace summary instead of the published-detail endpoint.`}
        />
      ) : null}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t`Overview`}</TabsTrigger>
          <TabsTrigger value="candidates">{t`Candidates`}</TabsTrigger>
          <TabsTrigger value="documents">{t`Documents`}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#10213d]">{t`Overview`}</h2>
              <div className="mt-4 space-y-2 text-sm text-[#60718d]">
                <p>
                  {t`Status:`}{' '}
                  <span className="align-middle">
                    <CompanyStatusBadge status={item.status} />
                  </span>
                </p>
                <p>
                  {t`Budget:`}{' '}
                  <span className="font-medium text-[#10213d]">
                    {normalizeUnknownText(item.budget) ?? t`Not specified`}
                  </span>
                </p>
                <p>
                  {t`Expected outcomes:`}{' '}
                  <span className="font-medium text-[#10213d]">
                    {normalizeUnknownText(item.expectedOutcomes) ?? t`Not specified`}
                  </span>
                </p>
                <p>
                  {t`Updated:`}{' '}
                  <span className="font-medium text-[#10213d]">
                    {formatUnknownDate(item.updatedAt)}
                  </span>
                </p>
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#10213d]">{t`Product owner`}</h2>
              <p className="mt-4 text-sm text-[#60718d]">
                {t`Assigned:`}{' '}
                <span className="font-medium text-[#10213d]">
                  {formatPersonName(item.productOwner) ?? t`Not assigned`}
                </span>
              </p>
              {item.productOwner ? null : (
                <p className="mt-2 text-sm text-amber-700">
                  {t`Product owner still needs assignment.`}
                </p>
              )}
              {hasPendingCandidateReview ? (
                <p className="mt-2 text-sm text-amber-700">{t`Candidate decisions are waiting.`}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {me ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={assignProductOwner.isPending}
                    onClick={() => void handleAssignProductOwner(me.id)}
                  >
                    {assignProductOwner.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t`Assign myself`}
                  </Button>
                ) : null}
                {isCompanyOwner ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSelectedMemberId('');
                      setIsPoOpen(true);
                    }}
                  >
                    {t`Assign a team member`}
                  </Button>
                ) : null}
              </div>
            </article>
          </div>
        </TabsContent>

        <TabsContent value="candidates">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Candidates`}</h2>
            <div className="mt-4 space-y-3">{candidatesContent}</div>
          </article>
        </TabsContent>

        <TabsContent value="documents">
          <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-[#10213d]">{t`Documents`}</h2>
            <div className="mt-4">
              <ProgramBDocumentManager
                documents={documents}
                categories={BACKLOG_DOCUMENT_CATEGORIES}
                isLoading={documentsQuery.isLoading && !documentsQuery.data}
                isError={documentsQuery.isError}
                canUpload={canEdit}
                disabled={!canEdit}
                createUpload={(input) =>
                  createDocumentUpload.mutateAsync({
                    id,
                    data: {
                      ...input,
                      category: input.category as CreateProgramBBacklogDocumentUploadDtoCategory,
                    },
                  })
                }
                completeUpload={(documentId, input) =>
                  completeDocumentUpload.mutateAsync({ id, documentId, data: input })
                }
                requestDownload={(documentId) =>
                  programBBacklogControllerRequestDocumentDownload(id, documentId)
                }
                onChanged={refreshWorkspace}
              />
            </div>
          </article>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t`Edit backlog item`}</DialogTitle>
            <DialogDescription>
              {t`Update the title, description, budget, and expected outcomes for this backlog item.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backlog-title">{t`Title`}</Label>
              <Input
                id="backlog-title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlog-description">{t`Description`}</Label>
              <Textarea
                id="backlog-description"
                rows={4}
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlog-budget">{t`Budget`}</Label>
              <Input
                id="backlog-budget"
                type="number"
                min={0}
                value={editBudget}
                onChange={(event) => setEditBudget(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlog-outcomes">{t`Expected outcomes`}</Label>
              <Textarea
                id="backlog-outcomes"
                rows={3}
                value={editExpectedOutcomes}
                onChange={(event) => setEditExpectedOutcomes(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              {t`Cancel`}
            </Button>
            <Button
              type="button"
              disabled={updateBacklog.isPending}
              onClick={() => void handleEditSubmit()}
            >
              {updateBacklog.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Save changes`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPoOpen} onOpenChange={setIsPoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t`Assign product owner`}</DialogTitle>
            <DialogDescription>
              {t`Choose an organization member to own delivery for this backlog item.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">{poDialogBody}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPoOpen(false)}>
              {t`Cancel`}
            </Button>
            <Button
              type="button"
              disabled={!selectedMemberId || assignProductOwner.isPending}
              onClick={() => void handleAssignProductOwner(selectedMemberId)}
            >
              {assignProductOwner.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t`Assign`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={decisionTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDecisionTarget(null);
            setDecisionReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decisionDialogTitle}</DialogTitle>
            <DialogDescription>
              {t`Optionally record a rationale for this decision. The team may see this note.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="decision-reason">{t`Reason (optional)`}</Label>
            <Textarea
              id="decision-reason"
              rows={3}
              maxLength={2000}
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDecisionTarget(null);
                setDecisionReason('');
              }}
            >
              {t`Cancel`}
            </Button>
            <Button
              type="button"
              disabled={isDecisionPending}
              onClick={() => void submitCandidateDecision()}
            >
              {isDecisionPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Confirm`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
