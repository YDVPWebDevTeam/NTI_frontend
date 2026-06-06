'use client';

import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
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
import { Button, Input, Textarea } from 'components/shadcn';
import { StudentSectionCard } from 'components/student-dashboard/page-shell-primitives';
import { uploadAndCompleteFile } from 'lib/api-client/openapi-runtime/file-upload';
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
    <div className="space-y-3 rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 text-sm text-neutral-700">
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
}: {
  applicationId: string;
  section: ApplicationSectionDto;
  canEdit: boolean;
}) {
  const [ideaOverviewSection, setIdeaOverviewSection] = useState<UpsertIdeaOverviewSectionDto>(() =>
    getInitialIdeaOverviewValue(section.valueJson),
  );

  const saveSection = useApplicationsControllerUpsertIdeaOverviewSection();

  const historyQuery = useApplicationsControllerGetSectionHistory(applicationId, section.key, {
    query: { enabled: true },
  });

  const canSave = canEdit && hasCompleteIdeaOverview(ideaOverviewSection) && !saveSection.isPending;

  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-neutral-950">{formatEnumLikeName(section.key)}</p>
        <p className="text-xs text-neutral-500">
          {t`Version`} {section.version}
        </p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            {t`Problem`}
          </span>
          <Input
            value={ideaOverviewSection.problem}
            disabled={!canEdit}
            onChange={(event) =>
              setIdeaOverviewSection((currentValue) => ({
                ...currentValue,
                problem: event.target.value,
              }))
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            {t`Solution`}
          </span>
          <Input
            value={ideaOverviewSection.solution}
            disabled={!canEdit}
            onChange={(event) =>
              setIdeaOverviewSection((currentValue) => ({
                ...currentValue,
                solution: event.target.value,
              }))
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            {t`Target users`}
          </span>
          <Input
            value={ideaOverviewSection.targetUsers}
            disabled={!canEdit}
            onChange={(event) =>
              setIdeaOverviewSection((currentValue) => ({
                ...currentValue,
                targetUsers: event.target.value,
              }))
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            {t`Value proposition`}
          </span>
          <Input
            value={ideaOverviewSection.valueProposition}
            disabled={!canEdit}
            onChange={(event) =>
              setIdeaOverviewSection((currentValue) => ({
                ...currentValue,
                valueProposition: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
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
              await historyQuery.refetch();
              toast.success(t`Saved ${formatEnumLikeName(section.key)}.`);
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
      <div className="space-y-3 text-sm text-neutral-700">
        <p>
          {t`Status`}:{' '}
          <span className="font-medium text-neutral-950">
            {formatEnumLikeName(application.status)}
          </span>
        </p>
        {application.submittedAt ? (
          <p>
            {t`Submitted`}:{' '}
            <span className="font-medium text-neutral-950">
              {formatUnknownDate(application.submittedAt)}
            </span>
          </p>
        ) : null}
        <p>
          {t`Created`}:{' '}
          <span className="font-medium text-neutral-950">
            {formatUnknownDate(application.createdAt)}
          </span>
        </p>
        <p>
          {t`Updated`}:{' '}
          <span className="font-medium text-neutral-950">
            {formatUnknownDate(application.updatedAt)}
          </span>
        </p>
      </div>
    </StudentSectionCard>
  );
}

export function SubmissionActionsSection({
  canResubmit,
  canSubmit,
  hasTeamLoadError,
  isLead,
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
        <p className="text-sm text-neutral-600">
          {isLead
            ? t`Submit is available for draft applications. Resubmit is available only when additional information is requested.`
            : t`Only the current team lead can submit or resubmit this application.`}
        </p>
        {hasTeamLoadError ? <RetryNotice message={teamErrorMessage} onRetry={onRetryTeam} /> : null}
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
  const requiredDocumentsCount = (requiredDocumentsQuery.data?.requiredDocuments ?? []).length;

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
        <div className="space-y-3 text-sm text-neutral-700">
          {requiredDocumentsQuery.isError ? (
            <RetryNotice
              message={getErrorMessage(
                requiredDocumentsQuery.error,
                t`The required documents for this call could not be loaded.`,
              )}
              onRetry={() => requiredDocumentsQuery.refetch()}
            />
          ) : null}
          <p>
            {t`Complete`}:{' '}
            <span className="font-medium text-neutral-950">
              {completenessQuery.data?.isComplete ? t`Yes` : t`No`}
            </span>
          </p>
          <p>
            {t`Required by call`}: {requiredDocumentsCount}
          </p>
          {missingDocuments.length > 0 ? (
            <div>
              <p className="font-medium text-neutral-950">{t`Missing`}</p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-600">
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
            <div key={signal.code} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
              <p className="font-semibold text-neutral-950">
                {formatEnumLikeName(signal.code)} · {signal.passed ? t`Passed` : t`Failed`}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
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
  const editableSections = useMemo(
    () => (sectionsQuery.data ?? []).filter((section) => section.key === IDEA_OVERVIEW_SECTION_KEY),
    [sectionsQuery.data],
  );

  if (
    !sectionsQuery.isError &&
    Array.isArray(sectionsQuery.data) &&
    editableSections.length === 0
  ) {
    return null;
  }

  return (
    <StudentSectionCard title={t`Sections`}>
      {sectionsQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            sectionsQuery.error,
            t`Application sections could not be loaded.`,
          )}
          onRetry={() => sectionsQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          {editableSections.map((section) => (
            <ApplicationSectionEditor
              key={`${section.id}-${section.version}`}
              applicationId={applicationId}
              section={section}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </StudentSectionCard>
  );
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
  const isCvDocument = documentType === 'CV';
  const canUpload =
    isLead &&
    Boolean(documentFile) &&
    !attachDocument.isPending &&
    (!isCvDocument || Boolean(selectedMemberUserId));

  return (
    <StudentSectionCard
      title={t`Attach document`}
      description={t`Upload a required document and attach it to this application.`}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
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
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
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

        <Input type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} />
        <div className="flex items-center">
          <Button
            disabled={!canUpload}
            onClick={async () => {
              if (!documentFile) {
                return;
              }

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
              }
            }}
          >
            {t`Upload and attach`}
          </Button>
        </div>
      </div>
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
              <div key={item.id} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
                <p className="font-semibold text-neutral-950">{formatEnumLikeName(item.status)}</p>
                <p className="mt-1 text-sm text-neutral-700">{item.message}</p>
                {item.replies.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {item.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-xl bg-white p-3 text-sm text-neutral-700"
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
