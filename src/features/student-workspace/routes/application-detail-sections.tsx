'use client';

import { t } from '@lingui/core/macro';
import { Download, Loader2 } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  type ApplicationDocumentDto,
  type ApplicationSectionDto,
  type AttachApplicationDocumentDtoDocumentType,
  type ApplicationsControllerAttachDocumentMutationBody,
  type FilesControllerCompleteUploadMutationBody,
  type FilesControllerCompleteUploadMutationResult,
  type FilesControllerRequestUploadUrlMutationBody,
  type FilesControllerRequestUploadUrlMutationResult,
  type TeamDetailDto,
  type UpsertIdeaOverviewSectionDto,
  useApplicationsControllerGetSectionHistory,
  useApplicationsControllerUpsertIdeaOverviewSection,
} from 'lib/api';
import { Button, Input, StatusBadge, Textarea } from 'components/shadcn';
import { StudentSectionCard } from 'components/student-dashboard/page-shell-primitives';
import { uploadAndCompleteFile } from 'lib/api-client/openapi-runtime/file-upload';
import { DOCUMENT_ACCEPT, validateDocumentFile } from 'lib/files/upload-validation';
import {
  formatEnumLikeName,
  formatUnknownDate,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';

const IDEA_OVERVIEW_SECTION_KEY = 'idea_overview';

const DOCUMENT_TYPE_OPTIONS: AttachApplicationDocumentDtoDocumentType[] = [
  'EXECUTIVE_SUMMARY',
  'TECHNICAL_ARCHITECTURE',
  'ROADMAP',
  'BUDGET',
  'RISK_ANALYSIS',
  'MONETIZATION_MODEL',
  'CV',
  'MOTIVATION_LETTER',
  'SOLUTION_PROPOSAL',
  'OTHER',
];

type QueryLike<TData> = {
  data?: TData;
  isError: boolean;
  isLoading?: boolean;
  error?: unknown;
  refetch: () => Promise<unknown>;
};

type MutationLike<TPayload> = {
  isPending: boolean;
  mutateAsync: (payload: TPayload) => Promise<unknown>;
};

type ApplicationOverview = {
  status: string;
  submittedAt?: unknown;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type MissingDocumentItem = {
  documentType: string;
  documentScope: string;
};

type EligibilitySignalItem = {
  code: string;
  passed: boolean;
  reason: unknown;
};

type NeedsInfoReplyItem = {
  id: string;
  message: string;
};

type NeedsInfoThreadItem = {
  id: string;
  status: string;
  message: string;
  replies: NeedsInfoReplyItem[];
};

type TeamMember = TeamDetailDto['members'][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function getInitialIdeaOverviewValue(valueJson: unknown): UpsertIdeaOverviewSectionDto {
  const value = isRecord(valueJson) ? valueJson : {};

  return {
    problem: readString(value.problem) ?? readString(value.name) ?? '',
    solution: readString(value.solution) ?? '',
    targetUsers: readString(value.targetUsers) ?? '',
    valueProposition: readString(value.valueProposition) ?? '',
  };
}

function hasCompleteIdeaOverview(value: UpsertIdeaOverviewSectionDto): boolean {
  return Boolean(
    value.problem.trim() &&
    value.solution.trim() &&
    value.targetUsers.trim() &&
    value.valueProposition.trim(),
  );
}

function getTeamMemberLabel(member: TeamMember): string {
  const fullName = `${member.user.firstName} ${member.user.lastName}`.trim();

  return fullName ? `${fullName} (${member.user.email})` : member.user.email;
}

export function RetryNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void | Promise<unknown>;
}) {
  return (
    <div className="border-border bg-muted text-muted-foreground space-y-3 rounded-2xl border p-4 text-sm">
      <p>{message}</p>
      <Button size="sm" variant="outline" onClick={() => void onRetry()}>
        {t`Retry`}
      </Button>
    </div>
  );
}

function ApplicationSectionEditor({
  applicationId,
  section,
  canEdit,
  onSaved,
}: {
  applicationId: string;
  // `null` means no `idea_overview` section exists yet — the editor bootstraps
  // the first version through the upsert endpoint (which creates version 1).
  section: ApplicationSectionDto | null;
  canEdit: boolean;
  onSaved?: () => void | Promise<unknown>;
}) {
  const sectionKey = section?.key ?? IDEA_OVERVIEW_SECTION_KEY;
  const [ideaOverviewSection, setIdeaOverviewSection] = useState<UpsertIdeaOverviewSectionDto>(() =>
    getInitialIdeaOverviewValue(section?.valueJson),
  );
  // Track whether the user has typed unsaved edits. While dirty we must NOT
  // reseed from incoming server data (a sibling mutation bumping the version
  // would otherwise clobber in-progress text), and we warn on navigation.
  const [isDirty, setIsDirty] = useState(false);

  const saveSection = useApplicationsControllerUpsertIdeaOverviewSection();

  // No history exists until the first version is saved, so keep the query
  // disabled while the section is still being bootstrapped.
  const historyQuery = useApplicationsControllerGetSectionHistory(applicationId, sectionKey, {
    query: { enabled: Boolean(section) },
  });

  // Reseed local state from server data only when the field is clean. This keeps
  // the editor in sync after a successful save / external update, but preserves
  // unsaved local edits when a version bump arrives mid-typing.
  const incomingValueJson = section?.valueJson;

  useEffect(() => {
    if (!isDirty) {
      setIdeaOverviewSection(getInitialIdeaOverviewValue(incomingValueJson));
    }
  }, [incomingValueJson, isDirty]);

  // Warn the user before they navigate away (tab close / reload) with unsaved edits.
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const updateField = (field: keyof UpsertIdeaOverviewSectionDto, value: string) => {
    setIsDirty(true);
    setIdeaOverviewSection((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const canSave = canEdit && hasCompleteIdeaOverview(ideaOverviewSection) && !saveSection.isPending;
  const showRequiredHint = canEdit && !hasCompleteIdeaOverview(ideaOverviewSection);

  return (
    <div className="border-border bg-muted rounded-2xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-foreground font-semibold">{formatEnumLikeName(sectionKey)}</p>
        <p className="text-muted-foreground text-xs">
          {section ? `${t`Version`} ${section.version}` : t`Not saved yet`}
        </p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
            {t`Problem`}
          </span>
          <Input
            value={ideaOverviewSection.problem}
            disabled={!canEdit}
            onChange={(event) => updateField('problem', event.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
            {t`Solution`}
          </span>
          <Input
            value={ideaOverviewSection.solution}
            disabled={!canEdit}
            onChange={(event) => updateField('solution', event.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
            {t`Target users`}
          </span>
          <Input
            value={ideaOverviewSection.targetUsers}
            disabled={!canEdit}
            onChange={(event) => updateField('targetUsers', event.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
            {t`Value proposition`}
          </span>
          <Input
            value={ideaOverviewSection.valueProposition}
            disabled={!canEdit}
            onChange={(event) => updateField('valueProposition', event.target.value)}
          />
        </label>
      </div>

      {showRequiredHint ? (
        <p className="text-muted-foreground mt-3 text-xs">
          {t`All fields are required to save this section.`}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {t`${historyQuery.data?.length ?? 0} historical version(s)`}
        </p>
        <Button
          size="sm"
          disabled={!canSave}
          onClick={async () => {
            try {
              await saveSection.mutateAsync({
                applicationId,
                data: {
                  problem: ideaOverviewSection.problem.trim(),
                  solution: ideaOverviewSection.solution.trim(),
                  targetUsers: ideaOverviewSection.targetUsers.trim(),
                  valueProposition: ideaOverviewSection.valueProposition.trim(),
                },
              });
              setIsDirty(false);
              // Refresh the parent sections list so a freshly bootstrapped
              // section rebinds to its persisted record, then reload history.
              await onSaved?.();
              await historyQuery.refetch();
              toast.success(t`Saved ${formatEnumLikeName(sectionKey)}.`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : t`Unable to save this section.`);
            }
          }}
        >
          {t`Save section`}
        </Button>
      </div>
    </div>
  );
}

export function OverviewSection({ application }: { application: ApplicationOverview }) {
  return (
    <StudentSectionCard title={t`Overview`}>
      <div className="text-muted-foreground space-y-3 text-sm">
        <p>
          {t`Status`}:{' '}
          <span className="text-foreground font-medium">
            {formatEnumLikeName(application.status)}
          </span>
        </p>
        {application.submittedAt ? (
          <p>
            {t`Submitted`}:{' '}
            <span className="text-foreground font-medium">
              {formatUnknownDate(application.submittedAt)}
            </span>
          </p>
        ) : null}
        <p>
          {t`Created`}:{' '}
          <span className="text-foreground font-medium">
            {formatUnknownDate(application.createdAt)}
          </span>
        </p>
        <p>
          {t`Updated`}:{' '}
          <span className="text-foreground font-medium">
            {formatUnknownDate(application.updatedAt)}
          </span>
        </p>
      </div>
    </StudentSectionCard>
  );
}

function getReadOnlyStatusMessage(status: string): string {
  if (status === 'SUBMITTED' || status === 'FORMALLY_VERIFIED' || status === 'EVALUATING') {
    return t`This application is under review by the NTI team. No edits are possible while it is being evaluated.`;
  }

  if (status === 'APPROVED') {
    return t`This application has been approved. It is now read-only.`;
  }

  if (status === 'REJECTED') {
    return t`This application has been rejected. It is now read-only.`;
  }

  return t`This application is read-only in its current status.`;
}

export function ReadOnlyStatusBanner({ status }: { status: string }) {
  return (
    <StudentSectionCard title={t`Submission actions`}>
      <div className="space-y-3">
        <div className="border-border bg-muted text-muted-foreground rounded-2xl border p-4 text-sm">
          <p className="text-foreground font-semibold">{formatEnumLikeName(status)}</p>
          <p className="mt-1">{getReadOnlyStatusMessage(status)}</p>
        </div>
      </div>
    </StudentSectionCard>
  );
}

export function SubmissionActionsSection({
  canResubmit,
  canSubmit,
  hasTeamLoadError,
  isLead,
  resubmitBlocked,
  onRetryTeam,
  onSubmit,
  onResubmit,
  isSubmitPending,
  isResubmitPending,
  resubmitNote,
  setResubmitNote,
  teamErrorMessage,
}: {
  canResubmit: boolean;
  canSubmit: boolean;
  hasTeamLoadError: boolean;
  isLead: boolean;
  resubmitBlocked: boolean;
  onRetryTeam: () => void;
  onSubmit: () => Promise<void>;
  onResubmit: () => Promise<void>;
  isSubmitPending: boolean;
  isResubmitPending: boolean;
  resubmitNote: string;
  setResubmitNote: (value: string) => void;
  teamErrorMessage: string;
}) {
  return (
    <StudentSectionCard title={t`Submission actions`}>
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          {isLead
            ? t`Submit is available for draft applications. Resubmit is available only when additional information is requested.`
            : t`Only the current team lead can submit or resubmit this application.`}
        </p>
        {hasTeamLoadError ? <RetryNotice message={teamErrorMessage} onRetry={onRetryTeam} /> : null}
        {resubmitBlocked ? (
          <p className="text-warning text-sm">
            {t`Reply to all open requests before resubmitting.`}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!canSubmit || isSubmitPending}
            onClick={() => void onSubmit()}
          >
            {t`Submit`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!canResubmit || isResubmitPending}
            title={resubmitBlocked ? t`Reply to all open requests before resubmitting.` : undefined}
            onClick={() => void onResubmit()}
          >
            {t`Resubmit`}
          </Button>
        </div>
        <Textarea
          value={resubmitNote}
          disabled={!canResubmit || isResubmitPending}
          onChange={(event) => setResubmitNote(event.target.value)}
          rows={4}
          placeholder={t`Optional resubmission note`}
        />
      </div>
    </StudentSectionCard>
  );
}

export function DocumentCompletenessSection({
  completenessQuery,
  requiredDocumentsQuery,
  getErrorMessage,
}: {
  completenessQuery: QueryLike<{ isComplete: boolean; missingDocuments: MissingDocumentItem[] }>;
  requiredDocumentsQuery: QueryLike<{ requiredDocuments: unknown[] }>;
  getErrorMessage: (error: unknown, fallback: string) => string;
}) {
  const missingDocuments = completenessQuery.data?.missingDocuments ?? [];
  // Only trust the count once the required-documents query has actually resolved.
  // While loading or on error, defaulting to 0 would contradict the verdict, so
  // show a dash instead.
  const hasRequiredDocumentsData =
    !requiredDocumentsQuery.isLoading &&
    !requiredDocumentsQuery.isError &&
    Array.isArray(requiredDocumentsQuery.data?.requiredDocuments);
  const requiredDocumentsCount = hasRequiredDocumentsData
    ? (requiredDocumentsQuery.data?.requiredDocuments ?? []).length
    : null;

  return (
    <StudentSectionCard title={t`Document completeness`}>
      {completenessQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            completenessQuery.error,
            t`Document completeness could not be loaded for this application.`,
          )}
          onRetry={() => completenessQuery.refetch()}
        />
      ) : (
        <div className="text-muted-foreground space-y-3 text-sm">
          {requiredDocumentsQuery.isError ? (
            <RetryNotice
              message={getErrorMessage(
                requiredDocumentsQuery.error,
                t`The required documents for this call could not be loaded.`,
              )}
              onRetry={() => requiredDocumentsQuery.refetch()}
            />
          ) : null}
          <p className="flex items-center gap-2">
            {t`Complete`}:{' '}
            <StatusBadge tone={completenessQuery.data?.isComplete ? 'success' : 'neutral'}>
              {completenessQuery.data?.isComplete ? t`Yes` : t`No`}
            </StatusBadge>
          </p>
          <p>
            {t`Required by call`}: {requiredDocumentsCount ?? '—'}
          </p>
          {missingDocuments.length > 0 ? (
            <div>
              <p className="text-foreground font-medium">{t`Missing`}</p>
              <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                {missingDocuments.map((item, index: number) => (
                  <li key={`${item.documentType}-${index}`}>
                    {formatEnumLikeName(item.documentType)} ·{' '}
                    {formatEnumLikeName(item.documentScope)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </StudentSectionCard>
  );
}

export function EligibilitySignalsSection({
  eligibilityQuery,
  getErrorMessage,
}: {
  eligibilityQuery: QueryLike<{ signals: EligibilitySignalItem[] }>;
  getErrorMessage: (error: unknown, fallback: string) => string;
}) {
  const signals = eligibilityQuery.data?.signals;

  if (!eligibilityQuery.isError && Array.isArray(signals) && signals.length === 0) {
    return null;
  }

  return (
    <StudentSectionCard title={t`Eligibility signals`}>
      {eligibilityQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            eligibilityQuery.error,
            t`Eligibility signals could not be loaded for this application.`,
          )}
          onRetry={() => eligibilityQuery.refetch()}
        />
      ) : (
        <div className="space-y-3">
          {(signals ?? []).map((signal) => (
            <div key={signal.code} className="border-border bg-muted rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-foreground font-semibold">{formatEnumLikeName(signal.code)}</p>
                <StatusBadge tone={signal.passed ? 'success' : 'danger'}>
                  {signal.passed ? t`Passed` : t`Failed`}
                </StatusBadge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {normalizeUnknownText(signal.reason) ?? t`No reason provided.`}
              </p>
            </div>
          ))}
        </div>
      )}
    </StudentSectionCard>
  );
}

export function SectionsEditorSection({
  applicationId,
  canEdit,
  sectionsQuery,
  getErrorMessage,
}: {
  applicationId: string;
  canEdit: boolean;
  sectionsQuery: QueryLike<ApplicationSectionDto[]>;
  getErrorMessage: (error: unknown, fallback: string) => string;
}) {
  const ideaOverviewSection = useMemo(
    () =>
      (sectionsQuery.data ?? []).find((section) => section.key === IDEA_OVERVIEW_SECTION_KEY) ??
      null,
    [sectionsQuery.data],
  );

  const hasLoadedSections = !sectionsQuery.isError && Array.isArray(sectionsQuery.data);

  let sectionsContent: ReactNode;

  if (sectionsQuery.isError) {
    sectionsContent = (
      <RetryNotice
        message={getErrorMessage(sectionsQuery.error, t`Application sections could not be loaded.`)}
        onRetry={() => sectionsQuery.refetch()}
      />
    );
  } else if (!hasLoadedSections) {
    sectionsContent = (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t`Loading sections…`}
      </div>
    );
  } else if (!ideaOverviewSection && !canEdit) {
    // No section exists yet and the viewer can't create one (read-only role or
    // non-draft status), so there is nothing to show or bootstrap.
    sectionsContent = (
      <p className="text-muted-foreground text-sm">{t`No sections have been filled in yet.`}</p>
    );
  } else {
    // Render the idea_overview editor even when no section exists yet: an
    // editable draft bootstraps version 1 through the existing upsert endpoint.
    sectionsContent = (
      <div className="space-y-4">
        <ApplicationSectionEditor
          // Keying by the section id (or a stable placeholder before it exists)
          // remounts the editor with fresh server state once the first save
          // persists the section.
          key={ideaOverviewSection?.id ?? 'idea_overview-new'}
          applicationId={applicationId}
          section={ideaOverviewSection}
          canEdit={canEdit}
          onSaved={() => sectionsQuery.refetch()}
        />
      </div>
    );
  }

  return <StudentSectionCard title={t`Sections`}>{sectionsContent}</StudentSectionCard>;
}

export function AttachDocumentSection({
  applicationId,
  isLead,
  members,
  attachDocument,
  requestUploadUrl,
  uploadToPresignedUrl,
  completeUpload,
  onAttached,
}: {
  applicationId: string;
  isLead: boolean;
  members: TeamMember[];
  attachDocument: MutationLike<{
    id: string;
    data: ApplicationsControllerAttachDocumentMutationBody;
  }>;
  requestUploadUrl: MutationLike<{ data: FilesControllerRequestUploadUrlMutationBody }>;
  uploadToPresignedUrl: MutationLike<{
    uploadUrl: string;
    file: File;
  }>;
  completeUpload: MutationLike<{ data: FilesControllerCompleteUploadMutationBody }>;
  onAttached: () => Promise<void>;
}) {
  const [documentType, setDocumentType] =
    useState<AttachApplicationDocumentDtoDocumentType>('EXECUTIVE_SUMMARY');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selectedMemberUserId, setSelectedMemberUserId] = useState('');
  // Covers the whole presign → S3 PUT → complete → attach pipeline, not just the
  // final attach mutation, so the button reflects the long upload too.
  const [isUploading, setIsUploading] = useState(false);
  const isCvDocument = documentType === 'CV';
  const isPipelinePending =
    isUploading ||
    requestUploadUrl.isPending ||
    uploadToPresignedUrl.isPending ||
    completeUpload.isPending ||
    attachDocument.isPending;
  const canUpload =
    isLead &&
    Boolean(documentFile) &&
    !isPipelinePending &&
    (!isCvDocument || Boolean(selectedMemberUserId));
  // Mirror the required-field portion of `canUpload` to explain a disabled button.
  const showUploadHint =
    isLead && !isPipelinePending && (!documentFile || (isCvDocument && !selectedMemberUserId));

  return (
    <StudentSectionCard
      title={t`Attach document`}
      description={t`Upload a required document and attach it to this application.`}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="border-border bg-card text-foreground rounded-md border px-3 py-2 text-sm"
          value={documentType}
          onChange={(event) => {
            const nextDocumentType = event.target.value as AttachApplicationDocumentDtoDocumentType;

            setDocumentType(nextDocumentType);

            if (nextDocumentType !== 'CV') {
              setSelectedMemberUserId('');
            }
          }}
        >
          {DOCUMENT_TYPE_OPTIONS.map((documentTypeOption) => (
            <option key={documentTypeOption} value={documentTypeOption}>
              {formatEnumLikeName(documentTypeOption)}
            </option>
          ))}
        </select>

        {isCvDocument ? (
          <select
            className="border-border bg-card text-foreground rounded-md border px-3 py-2 text-sm"
            value={selectedMemberUserId}
            onChange={(event) => setSelectedMemberUserId(event.target.value)}
          >
            <option value="">{t`Select a team member for CV`}</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {getTeamMemberLabel(member)}
              </option>
            ))}
          </select>
        ) : null}

        <Input
          type="file"
          accept={DOCUMENT_ACCEPT}
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;

            if (nextFile) {
              const validation = validateDocumentFile(nextFile);

              if (!validation.ok) {
                toast.error(validation.message);
                event.target.value = '';
                setDocumentFile(null);

                return;
              }
            }

            setDocumentFile(nextFile);
          }}
        />
        <div className="flex items-center">
          <Button
            disabled={!canUpload}
            onClick={async () => {
              if (!documentFile) {
                return;
              }

              const validation = validateDocumentFile(documentFile);

              if (!validation.ok) {
                toast.error(validation.message);

                return;
              }

              setIsUploading(true);

              try {
                const uploadedFile = await uploadAndCompleteFile(
                  {
                    requestUploadUrl: (payload: FilesControllerRequestUploadUrlMutationBody) =>
                      requestUploadUrl.mutateAsync({
                        data: payload,
                      }) as Promise<FilesControllerRequestUploadUrlMutationResult>,
                    uploadToPresignedUrl: (payload: { uploadUrl: string; file: File }) =>
                      uploadToPresignedUrl.mutateAsync(payload) as Promise<void>,
                    completeUpload: (payload: FilesControllerCompleteUploadMutationBody) =>
                      completeUpload.mutateAsync({
                        data: payload,
                      }) as Promise<FilesControllerCompleteUploadMutationResult>,
                  },
                  {
                    file: documentFile,
                    purpose: 'APPLICATION_DOCUMENT',
                    entityType: 'APPLICATION',
                  },
                );

                await attachDocument.mutateAsync({
                  id: applicationId,
                  data: {
                    fileId: uploadedFile.id,
                    documentType,
                    memberUserId: isCvDocument ? selectedMemberUserId : undefined,
                  },
                });

                setDocumentFile(null);
                setSelectedMemberUserId('');
                await onAttached();
                toast.success(t`Document attached.`);
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : t`Unable to attach the document.`,
                );
              } finally {
                setIsUploading(false);
              }
            }}
          >
            {isPipelinePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t`Uploading…`}
              </>
            ) : (
              t`Upload and attach`
            )}
          </Button>
        </div>
      </div>
      {showUploadHint ? (
        <p className="text-muted-foreground mt-3 text-xs">
          {isCvDocument
            ? t`Select a file and a team member before uploading.`
            : t`Select a file before uploading.`}
        </p>
      ) : null}
    </StudentSectionCard>
  );
}

const BYTES_IN_KB = 1024;
const BYTES_IN_MB = BYTES_IN_KB * BYTES_IN_KB;

function formatDocumentSize(size: number): string {
  if (!Number.isFinite(size) || size <= 0) {
    return '';
  }

  if (size < BYTES_IN_KB) {
    return `${size} B`;
  }

  if (size < BYTES_IN_MB) {
    return `${(size / BYTES_IN_KB).toFixed(1)} KB`;
  }

  return `${(size / BYTES_IN_MB).toFixed(1)} MB`;
}

export function AttachedDocumentsSection({
  documentsQuery,
  requestDownload,
}: {
  documentsQuery: QueryLike<ApplicationDocumentDto[]>;
  requestDownload: (documentId: string) => Promise<{ downloadUrl: string }>;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const documents = documentsQuery.data ?? [];

  const handleDownload = async (documentId: string) => {
    setDownloadingId(documentId);

    try {
      const result = await requestDownload(documentId);
      // Mirror the document-download behaviour used elsewhere: prefer a new tab,
      // and fall back to same-tab navigation when the popup is blocked.
      const popup = window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');

      if (!popup) {
        window.location.href = result.downloadUrl;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to download the document.`);
    } finally {
      setDownloadingId(null);
    }
  };

  let content: ReactNode;

  if (documentsQuery.isLoading) {
    content = <p className="text-muted-foreground text-sm">{t`Loading attached documents…`}</p>;
  } else if (documentsQuery.isError) {
    content = <p className="text-destructive text-sm">{t`Unable to load attached documents.`}</p>;
  } else if (documents.length === 0) {
    content = (
      <p className="text-muted-foreground text-sm">{t`No documents have been attached yet.`}</p>
    );
  } else {
    content = (
      <ul className="space-y-3">
        {documents.map((document) => {
          const sizeLabel = formatDocumentSize(document.size);

          return (
            <li
              key={document.id}
              className="border-border bg-muted flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0">
                <p className="text-foreground truncate font-medium">{document.originalName}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatEnumLikeName(document.documentType)}
                  {sizeLabel ? ` · ${sizeLabel}` : ''}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={downloadingId === document.id}
                onClick={() => void handleDownload(document.id)}
              >
                {downloadingId === document.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t`Download`}
              </Button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <StudentSectionCard
      title={t`Attached documents`}
      description={t`Documents currently attached to this application. Download to review the uploaded files.`}
    >
      {content}
    </StudentSectionCard>
  );
}

export function NeedsInfoThreadSection({
  applicationId,
  isLead,
  needsInfoQuery,
  replyToNeedsInfo,
  getErrorMessage,
}: {
  applicationId: string;
  isLead: boolean;
  needsInfoQuery: QueryLike<{ items: NeedsInfoThreadItem[] }>;
  replyToNeedsInfo: MutationLike<{
    id: string;
    itemId: string;
    data: { message: string };
  }>;
  getErrorMessage: (error: unknown, fallback: string) => string;
}) {
  const [needsInfoReplyText, setNeedsInfoReplyText] = useState<Record<string, string>>({});
  const items = needsInfoQuery.data?.items;

  if (!needsInfoQuery.isError && Array.isArray(items) && items.length === 0) {
    return null;
  }

  return (
    <StudentSectionCard title={t`Needs-info thread`}>
      {needsInfoQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            needsInfoQuery.error,
            t`The needs-info thread could not be loaded.`,
          )}
          onRetry={() => needsInfoQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          {(items ?? []).map((item) => {
            const canReply = isLead && item.status === 'OPEN';
            const replyText = needsInfoReplyText[item.id] ?? '';

            return (
              <div key={item.id} className="border-border bg-muted rounded-2xl border p-4">
                <StatusBadge tone={item.status === 'OPEN' ? 'warning' : 'success'}>
                  {formatEnumLikeName(item.status)}
                </StatusBadge>
                <p className="text-foreground mt-1 text-sm">{item.message}</p>
                {item.replies.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {item.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="border-border bg-card text-foreground rounded-xl border p-3 text-sm"
                      >
                        {reply.message}
                      </div>
                    ))}
                  </div>
                ) : null}
                {canReply ? (
                  <>
                    <Textarea
                      className="mt-3"
                      rows={3}
                      value={replyText}
                      onChange={(event) =>
                        setNeedsInfoReplyText((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      placeholder={t`Reply to this needs-info item`}
                    />
                    <div className="mt-3">
                      <Button
                        size="sm"
                        disabled={!replyText.trim() || replyToNeedsInfo.isPending}
                        onClick={async () => {
                          try {
                            await replyToNeedsInfo.mutateAsync({
                              id: applicationId,
                              itemId: item.id,
                              data: { message: replyText.trim() },
                            });
                            setNeedsInfoReplyText((current) => ({ ...current, [item.id]: '' }));
                            await needsInfoQuery.refetch();
                            toast.success(t`Needs-info reply posted.`);
                          } catch (error) {
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : t`Unable to reply to the needs-info item.`,
                            );
                          }
                        }}
                      >
                        {t`Send reply`}
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </StudentSectionCard>
  );
}
