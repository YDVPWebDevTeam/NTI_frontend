'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import {
  type ApplicationProfileSectionValueDto,
  type ApplicationSectionDto,
  type AttachApplicationDocumentDtoDocumentType,
  type ApplicationsControllerAttachDocumentMutationBody,
  type FilesControllerCompleteUploadMutationBody,
  type FilesControllerCompleteUploadMutationResult,
  type FilesControllerRequestUploadUrlMutationBody,
  type FilesControllerRequestUploadUrlMutationResult,
  useApplicationsControllerGetSectionHistory,
  useApplicationsControllerUpsertSection,
} from 'lib/api';
import { Button, Input, Textarea } from 'components/shadcn';
import { StudentSectionCard } from 'components/student-dashboard/page-shell';
import { uploadAndCompleteFile } from 'lib/api-client/openapi-runtime/file-upload';
import { formatUnknownDate, normalizeUnknownText } from 'lib/student-dashboard/normalizers';

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
        Retry
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
  const [profileSection, setProfileSection] = useState<ApplicationProfileSectionValueDto>(
    section.valueJson,
  );
  const saveSection = useApplicationsControllerUpsertSection();
  const historyQuery = useApplicationsControllerGetSectionHistory(applicationId, section.key, {
    query: { enabled: true },
  });

  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-neutral-950">{section.key}</p>
        <p className="text-xs text-neutral-500">version {section.version}</p>
      </div>
      <label className="mt-3 block space-y-2">
        <span className="text-xs font-medium tracking-[0.12em] text-neutral-500 uppercase">
          Name
        </span>
        <Input
          value={profileSection.name}
          disabled={!canEdit}
          onChange={(event) =>
            setProfileSection((currentValue) => ({ ...currentValue, name: event.target.value }))
          }
        />
      </label>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          {historyQuery.data?.length ?? 0} historical version(s)
        </p>
        <Button
          size="sm"
          disabled={!canEdit || saveSection.isPending}
          onClick={async () => {
            try {
              await saveSection.mutateAsync({
                applicationId,
                key: section.key,
                data: { valueJson: profileSection },
              });
              await historyQuery.refetch();
              toast.success(`Saved ${section.key}.`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Unable to save this section.');
            }
          }}
        >
          Save section
        </Button>
      </div>
    </div>
  );
}

export function OverviewSection({ application }: { application: ApplicationOverview }) {
  return (
    <StudentSectionCard title="Overview">
      <div className="space-y-3 text-sm text-neutral-700">
        <p>
          Status: <span className="font-medium text-neutral-950">{application.status}</span>
        </p>
        <p>
          Call id: <span className="font-medium text-neutral-950">{application.callId}</span>
        </p>
        <p>
          Team id: <span className="font-medium text-neutral-950">{application.teamId}</span>
        </p>
        <p>
          Created:{' '}
          <span className="font-medium text-neutral-950">
            {formatUnknownDate(application.createdAt)}
          </span>
        </p>
        <p>
          Updated:{' '}
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
    <StudentSectionCard title="Submission actions">
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          Lead-only actions stay disabled unless the current team lead matches the application team.
        </p>
        {hasTeamLoadError ? <RetryNotice message={teamErrorMessage} onRetry={onRetryTeam} /> : null}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={!isLead || isSubmitPending} onClick={() => void onSubmit()}>
            Submit
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!isLead || isResubmitPending}
            onClick={() => void onResubmit()}
          >
            Resubmit
          </Button>
        </div>
        <Textarea
          value={resubmitNote}
          onChange={(event) => setResubmitNote(event.target.value)}
          rows={4}
          placeholder="Optional resubmission note"
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
    <StudentSectionCard title="Document completeness">
      {completenessQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            completenessQuery.error,
            'Document completeness could not be loaded for this application.',
          )}
          onRetry={() => completenessQuery.refetch()}
        />
      ) : (
        <div className="space-y-3 text-sm text-neutral-700">
          {requiredDocumentsQuery.isError ? (
            <RetryNotice
              message={getErrorMessage(
                requiredDocumentsQuery.error,
                'The required documents for this call could not be loaded.',
              )}
              onRetry={() => requiredDocumentsQuery.refetch()}
            />
          ) : null}
          <p>
            Complete:{' '}
            <span className="font-medium text-neutral-950">
              {completenessQuery.data?.isComplete ? 'Yes' : 'No'}
            </span>
          </p>
          <p>Required by call: {(requiredDocumentsQuery.data?.requiredDocuments ?? []).length}</p>
          <div>
            <p className="font-medium text-neutral-950">Missing</p>
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
    <StudentSectionCard title="Eligibility signals">
      {eligibilityQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            eligibilityQuery.error,
            'Eligibility signals could not be loaded for this application.',
          )}
          onRetry={() => eligibilityQuery.refetch()}
        />
      ) : (
        <div className="space-y-3">
          {(eligibilityQuery.data?.signals ?? []).map((signal) => (
            <div key={signal.code} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
              <p className="font-semibold text-neutral-950">
                {signal.code} · {signal.passed ? 'Passed' : 'Failed'}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {normalizeUnknownText(signal.reason) ?? 'No reason provided.'}
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
    <StudentSectionCard title="Sections">
      {sectionsQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            sectionsQuery.error,
            'Application sections could not be loaded.',
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
      title="Attach document"
      description="Generated file upload endpoints handle the upload-url -> PUT -> complete flow before attaching the file to the application."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
          value={documentType}
          onChange={(event) =>
            setDocumentType(event.target.value as AttachApplicationDocumentDtoDocumentType)
          }
        >
          <option value="EXECUTIVE_SUMMARY">EXECUTIVE_SUMMARY</option>
          <option value="TECHNICAL_ARCHITECTURE">TECHNICAL_ARCHITECTURE</option>
          <option value="ROADMAP">ROADMAP</option>
          <option value="BUDGET">BUDGET</option>
          <option value="RISK_ANALYSIS">RISK_ANALYSIS</option>
          <option value="MONETIZATION_MODEL">MONETIZATION_MODEL</option>
          <option value="CV">CV</option>
          <option value="MOTIVATION_LETTER">MOTIVATION_LETTER</option>
          <option value="SOLUTION_PROPOSAL">SOLUTION_PROPOSAL</option>
          <option value="OTHER">OTHER</option>
        </select>
        <Input
          value={memberUserId}
          onChange={(event) => setMemberUserId(event.target.value)}
          placeholder="Member user id for CV uploads"
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
                toast.success('Document attached.');
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : 'Unable to attach the document.',
                );
              }
            }}
          >
            Upload and attach
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
    <StudentSectionCard title="Needs-info thread">
      {needsInfoQuery.isError ? (
        <RetryNotice
          message={getErrorMessage(
            needsInfoQuery.error,
            'The needs-info thread could not be loaded.',
          )}
          onRetry={() => needsInfoQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          {(needsInfoQuery.data?.items ?? []).map((item) => (
            <div key={item.id} className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
              <p className="font-semibold text-neutral-950">{item.status}</p>
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
                placeholder="Reply to this needs-info item"
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
                      toast.success('Needs-info reply posted.');
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : 'Unable to reply to the needs-info item.',
                      );
                    }
                  }}
                >
                  Send reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentSectionCard>
  );
}
