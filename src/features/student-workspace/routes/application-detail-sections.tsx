'use client';

import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  type ApplicationSectionDto,
  type AttachApplicationDocumentDtoDocumentType,
  type ApplicationsControllerAttachDocumentMutationBody,
  type FilesControllerCompleteUploadMutationBody,
  type FilesControllerCompleteUploadMutationResult,
  type FilesControllerRequestUploadUrlMutationBody,
  type FilesControllerRequestUploadUrlMutationResult,
  type UpsertIdeaOverviewSectionDto,
  useApplicationsControllerGetSectionHistory,
  useApplicationsControllerUpsertIdeaOverviewSection,
} from 'lib/api';
import { Button, Input, Textarea } from 'components/shadcn';
import { StudentSectionCard } from 'components/student-dashboard/page-shell-primitives';
import { uploadAndCompleteFile } from 'lib/api-client/openapi-runtime/file-upload';
import { formatUnknownDate, normalizeUnknownText } from 'lib/student-dashboard/normalizers';

const IDEA_OVERVIEW_SECTION_KEY = 'idea_overview';

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
  callId: string;
  teamId: string;
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

function formatApplicationStatus(status: string): string {
  switch (status) {
    case 'DRAFT':
      return t`Draft`;

    case 'SUBMITTED':
      return t`Submitted`;

    case 'FORMALLY_VERIFIED':
      return t`Formally verified`;

    case 'EVALUATING':
      return t`Evaluating`;

    case 'NEEDS_INFO':
      return t`Needs info`;

    case 'APPROVED':
      return t`Approved`;

    case 'ONBOARDING':
      return t`Onboarding`;

    case 'ACTIVE_PROJECT':
      return t`Active project`;

    case 'PAUSED':
      return t`Paused`;

    case 'COMPLETED':
      return t`Completed`;

    case 'REJECTED':
      return t`Rejected`;

    case 'ARCHIVED':
      return t`Archived`;

    default:
      return status;
  }
}

function formatNeedsInfoStatus(status: string): string {
  switch (status) {
    case 'OPEN':
      return t`Open`;

    case 'RESOLVED':
      return t`Resolved`;

    case 'CANCELLED':
      return t`Cancelled`;

    default:
      return status;
  }
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

  const isIdeaOverviewSection = section.key === IDEA_OVERVIEW_SECTION_KEY;
  const canSave =
    canEdit &&
    isIdeaOverviewSection &&
    hasCompleteIdeaOverview(ideaOverviewSection) &&
    !saveSection.isPending;

  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-neutral-950">{section.key}</p>
        <p className="text-xs text-neutral-500">
          {t`Version`} {section.version}
        </p>
      </div>

      {isIdeaOverviewSection ? null : (
        <p className="mt-3 text-sm text-neutral-600">
          {t`This generated API currently supports editing only the idea overview section.`}
        </p>
      )}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
            {t`Problem`}
          </span>
          <Input
            value={ideaOverviewSection.problem}
            disabled={!canEdit || !isIdeaOverviewSection}
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
            disabled={!canEdit || !isIdeaOverviewSection}
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
            disabled={!canEdit || !isIdeaOverviewSection}
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
            disabled={!canEdit || !isIdeaOverviewSection}
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
              toast.success(t`Saved ${section.key}.`);
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
            {formatApplicationStatus(application.status)}
          </span>
        </p>
        <p>
          {t`Call id`}: <span className="font-medium text-neutral-950">{application.callId}</span>
        </p>
        <p>
          {t`Team id`}: <span className="font-medium text-neutral-950">{application.teamId}</span>
        </p>
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
          {t`Lead-only actions stay disabled unless the current team lead matches the application team.`}
        </p>
        {hasTeamLoadError ? <RetryNotice message={teamErrorMessage} onRetry={onRetryTeam} /> : null}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={!isLead || isSubmitPending} onClick={() => void onSubmit()}>
            {t`Submit`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!isLead || isResubmitPending}
            onClick={() => void onResubmit()}
          >
            {t`Resubmit`}
          </Button>
        </div>
        <Textarea
          value={resubmitNote}
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
            {t`Required by call`}: {(requiredDocumentsQuery.data?.requiredDocuments ?? []).length}
          </p>
          <div>
            <p className="font-medium text-neutral-950">{t`Missing`}</p>
            <ul className="mt-2 space-y-1 text-sm text-neutral-600">
              {(completenessQuery.data?.missingDocuments ?? []).map((item, index: number) => (
                <li key={`${item.documentType}-${index}`}>
                  {item.documentType} · {item.documentScope}
                </li>
              ))}
            </ul>
          </div>
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
          {(eligibilityQuery.data?.signals ?? []).map((signal) => (
            <div key={signal.code} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
              <p className="font-semibold text-neutral-950">
                {signal.code} · {signal.passed ? t`Passed` : t`Failed`}
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
          {(sectionsQuery.data ?? []).map((section) => (
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
  attachDocument,
  requestUploadUrl,
  uploadToPresignedUrl,
  completeUpload,
  onAttached,
}: {
  applicationId: string;
  isLead: boolean;
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
  const [memberUserId, setMemberUserId] = useState('');

  return (
    <StudentSectionCard
      title={t`Attach document`}
      description={t`Generated file upload endpoints handle the upload-url -> PUT -> complete flow before attaching the file to the application.`}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
          value={documentType}
          onChange={(event) =>
            setDocumentType(event.target.value as AttachApplicationDocumentDtoDocumentType)
          }
        >
          <option value="EXECUTIVE_SUMMARY">{t`Executive summary`}</option>
          <option value="TECHNICAL_ARCHITECTURE">{t`Technical architecture`}</option>
          <option value="ROADMAP">{t`Roadmap`}</option>
          <option value="BUDGET">{t`Budget`}</option>
          <option value="RISK_ANALYSIS">{t`Risk analysis`}</option>
          <option value="MONETIZATION_MODEL">{t`Monetization model`}</option>
          <option value="CV">{t`CV`}</option>
          <option value="MOTIVATION_LETTER">{t`Motivation letter`}</option>
          <option value="SOLUTION_PROPOSAL">{t`Solution proposal`}</option>
          <option value="OTHER">{t`Other`}</option>
        </select>
        <Input
          value={memberUserId}
          onChange={(event) => setMemberUserId(event.target.value)}
          placeholder={t`Member user id for CV uploads`}
        />
        <Input type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} />
        <div className="flex items-center">
          <Button
            disabled={!isLead || !documentFile || attachDocument.isPending}
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
                    memberUserId: memberUserId.trim() || undefined,
                  },
                });

                setDocumentFile(null);
                setMemberUserId('');
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
          {(needsInfoQuery.data?.items ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
              <p className="font-semibold text-neutral-950">{formatNeedsInfoStatus(item.status)}</p>
              <p className="mt-1 text-sm text-neutral-700">{item.message}</p>
              <div className="mt-3 space-y-2">
                {item.replies.map((reply) => (
                  <div key={reply.id} className="rounded-xl bg-white p-3 text-sm text-neutral-700">
                    {reply.message}
                  </div>
                ))}
              </div>
              <Textarea
                className="mt-3"
                rows={3}
                value={needsInfoReplyText[item.id] ?? ''}
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
                  disabled={
                    !isLead || !needsInfoReplyText[item.id]?.trim() || replyToNeedsInfo.isPending
                  }
                  onClick={async () => {
                    try {
                      await replyToNeedsInfo.mutateAsync({
                        id: applicationId,
                        itemId: item.id,
                        data: { message: needsInfoReplyText[item.id].trim() },
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
            </div>
          ))}
        </div>
      )}
    </StudentSectionCard>
  );
}
