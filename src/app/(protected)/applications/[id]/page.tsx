'use client';

import { use } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  type ApplicationSectionDto,
  type AttachApplicationDocumentDtoDocumentType,
  UserRole,
  useApplicationsControllerAttachDocument,
  useApplicationsControllerFindById,
  useApplicationsControllerGetDocumentCompleteness,
  useApplicationsControllerGetEligibilitySignals,
  useApplicationsControllerGetNeedsInfoThread,
  useApplicationsControllerGetSectionHistory,
  useApplicationsControllerListSections,
  useApplicationsControllerReplyToNeedsInfoItem,
  useApplicationsControllerResubmit,
  useApplicationsControllerSubmit,
  useApplicationsControllerUpsertSection,
  useCallsDocumentsControllerGetRequiredDocuments,
  useFilesControllerCompleteUpload,
  useFilesControllerRequestUploadUrl,
  useTeamControllerFindCurrentForUser,
} from 'lib/api';
import { Button, Input, Textarea } from 'components/shadcn';
import {
  StudentPageShell,
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell';
import {
  uploadAndCompleteFile,
  useUploadToPresignedUrl,
} from 'lib/api-client/openapi-runtime/file-upload';
import {
  formatUnknownDate,
  isApiNotFoundError,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

type SectionFormModel = {
  rawJson: string;
};

type NeedsInfoReplyPayload = {
  message: string;
};

type ResubmitPayload = {
  note?: string;
};

const JSON_INDENT_SPACES = 2;

function ApplicationSectionEditor({
  applicationId,
  section,
  canEdit,
}: {
  applicationId: string;
  section: ApplicationSectionDto;
  canEdit: boolean;
}) {
  const [formState, setFormState] = useState<SectionFormModel>({
    rawJson: JSON.stringify(section.valueJson, null, JSON_INDENT_SPACES),
  });
  const saveSection = useApplicationsControllerUpsertSection();
  const historyQuery = useApplicationsControllerGetSectionHistory(applicationId, section.key, {
    query: {
      enabled: true,
    },
  });

  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-neutral-950">{section.key}</p>
        <p className="text-xs text-neutral-500">version {section.version}</p>
      </div>
      <Textarea
        className="mt-3 font-mono text-xs"
        rows={10}
        value={formState.rawJson}
        disabled={!canEdit}
        onChange={(event) => setFormState({ rawJson: event.target.value })}
      />
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
                data: { valueJson: JSON.parse(formState.rawJson) as Record<string, unknown> },
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

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me, isLoading } = useAuthenticatedUser([UserRole.STUDENT]);
  const [documentType, setDocumentType] =
    useState<AttachApplicationDocumentDtoDocumentType>('EXECUTIVE_SUMMARY');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [memberUserId, setMemberUserId] = useState('');
  const [needsInfoReplyText, setNeedsInfoReplyText] = useState<Record<string, string>>({});
  const [resubmitNote, setResubmitNote] = useState('');

  const applicationQuery = useApplicationsControllerFindById(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const teamQuery = useTeamControllerFindCurrentForUser({
    query: {
      enabled: Boolean(me),
      retry: false,
    },
  });
  const team = isApiNotFoundError(teamQuery.error) ? null : (teamQuery.data ?? null);
  const isLead = Boolean(
    me &&
    team &&
    applicationQuery.data &&
    team.id === applicationQuery.data.teamId &&
    team.leaderId === me.id,
  );
  const completenessQuery = useApplicationsControllerGetDocumentCompleteness(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const eligibilityQuery = useApplicationsControllerGetEligibilitySignals(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const needsInfoQuery = useApplicationsControllerGetNeedsInfoThread(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const sectionsQuery = useApplicationsControllerListSections(id, {
    query: {
      enabled: !isLoading,
    },
  });
  const requiredDocumentsQuery = useCallsDocumentsControllerGetRequiredDocuments(
    applicationQuery.data?.callId ?? '',
    {
      query: {
        enabled: Boolean(applicationQuery.data?.callId),
      },
    },
  );

  const requestUploadUrl = useFilesControllerRequestUploadUrl();
  const uploadToPresignedUrl = useUploadToPresignedUrl();
  const completeUpload = useFilesControllerCompleteUpload();
  const attachDocument = useApplicationsControllerAttachDocument();
  const submitApplication = useApplicationsControllerSubmit();
  const replyToNeedsInfo = useApplicationsControllerReplyToNeedsInfoItem();
  const resubmitApplication = useApplicationsControllerResubmit();

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title="Loading application"
          description="Resolving your student session and Program A application detail."
        />
      </main>
    );
  }

  const application = applicationQuery.data;

  return (
    <StudentPageShell
      title={application ? `Application ${application.id}` : 'Program A application'}
      description="Generated Program A detail shell with sections, document completeness, eligibility signals, needs-info thread, and lead-only submit or resubmit actions."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <StudentSectionCard title="Overview">
          <div className="space-y-3 text-sm text-neutral-700">
            <p>
              Status: <span className="font-medium text-neutral-950">{application?.status}</span>
            </p>
            <p>
              Call id: <span className="font-medium text-neutral-950">{application?.callId}</span>
            </p>
            <p>
              Team id: <span className="font-medium text-neutral-950">{application?.teamId}</span>
            </p>
            <p>
              Created:{' '}
              <span className="font-medium text-neutral-950">
                {formatUnknownDate(application?.createdAt)}
              </span>
            </p>
            <p>
              Updated:{' '}
              <span className="font-medium text-neutral-950">
                {formatUnknownDate(application?.updatedAt)}
              </span>
            </p>
          </div>
        </StudentSectionCard>

        <StudentSectionCard title="Submission actions">
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">
              Lead-only actions stay disabled unless the current team lead matches the application
              team.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={!isLead || submitApplication.isPending}
                onClick={async () => {
                  try {
                    await submitApplication.mutateAsync({ id });
                    await applicationQuery.refetch();
                    toast.success('Application submitted.');
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : 'Unable to submit the application.',
                    );
                  }
                }}
              >
                Submit
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!isLead || resubmitApplication.isPending}
                onClick={async () => {
                  const payload: ResubmitPayload = resubmitNote.trim()
                    ? { note: resubmitNote.trim() }
                    : {};

                  try {
                    await resubmitApplication.mutateAsync({
                      id,
                      data: payload as Record<string, unknown>,
                    });
                    await Promise.all([applicationQuery.refetch(), needsInfoQuery.refetch()]);
                    toast.success('Application resubmitted.');
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : 'Unable to resubmit the application.',
                    );
                  }
                }}
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentSectionCard title="Document completeness">
          <div className="space-y-3 text-sm text-neutral-700">
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
                {(completenessQuery.data?.missingDocuments ?? []).map((item, index) => (
                  <li key={`${item.documentType}-${index}`}>
                    {item.documentType} · {item.documentScope}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </StudentSectionCard>

        <StudentSectionCard title="Eligibility signals">
          <div className="space-y-3">
            {(eligibilityQuery.data?.signals ?? []).map((signal) => (
              <div
                key={signal.code}
                className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4"
              >
                <p className="font-semibold text-neutral-950">
                  {signal.code} · {signal.passed ? 'Passed' : 'Failed'}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {normalizeUnknownText(signal.reason) ?? 'No reason provided.'}
                </p>
              </div>
            ))}
          </div>
        </StudentSectionCard>
      </div>

      <StudentSectionCard title="Sections">
        <div className="space-y-4">
          {(sectionsQuery.data ?? []).map((section) => (
            <ApplicationSectionEditor
              key={section.id}
              applicationId={id}
              section={section}
              canEdit={isLead}
            />
          ))}
        </div>
      </StudentSectionCard>

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
          <Input
            type="file"
            onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
          />
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
                      requestUploadUrl: (payload) =>
                        requestUploadUrl.mutateAsync({ data: payload }),
                      uploadToPresignedUrl: uploadToPresignedUrl.mutateAsync,
                      completeUpload: (payload) => completeUpload.mutateAsync({ data: payload }),
                    },
                    {
                      file: documentFile,
                      purpose: 'APPLICATION_DOCUMENT',
                      entityType: 'APPLICATION',
                    },
                  );

                  await attachDocument.mutateAsync({
                    id,
                    data: {
                      fileId: uploadedFile.id,
                      documentType,
                      memberUserId: memberUserId.trim() || undefined,
                    },
                  });

                  setDocumentFile(null);
                  setMemberUserId('');
                  await completenessQuery.refetch();
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

      <StudentSectionCard title="Needs-info thread">
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
                    const payload: NeedsInfoReplyPayload = {
                      message: needsInfoReplyText[item.id].trim(),
                    };

                    try {
                      await replyToNeedsInfo.mutateAsync({
                        id,
                        itemId: item.id,
                        data: payload as Record<string, unknown>,
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
      </StudentSectionCard>
    </StudentPageShell>
  );
}
