'use client';

import { t } from '@lingui/core/macro';
import { use, useState } from 'react';
import { toast } from 'sonner';

import {
  applicationsControllerRequestDocumentDownloadUrl,
  useApplicationsControllerListMentorshipNotes,
  useApplicationsControllerAttachDocument,
  useApplicationsControllerFindById,
  useApplicationsControllerGetDocumentCompleteness,
  useApplicationsControllerListDocuments,
  useApplicationsControllerGetEligibilitySignals,
  useApplicationsControllerGetNeedsInfoThread,
  useApplicationsControllerListSections,
  useApplicationsControllerReplyToNeedsInfoItem,
  useApplicationsControllerResubmit,
  useApplicationsControllerSubmit,
  useCallsDocumentsControllerGetRequiredDocuments,
  useFilesControllerCompleteUpload,
  useFilesControllerRequestUploadUrl,
  useTeamControllerFindCurrentForUser,
} from 'lib/api';
import { Button } from 'components/shadcn';

import {
  StudentPageShell,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell-primitives';
import { useUploadToPresignedUrl } from 'lib/api-client/openapi-runtime/file-upload';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { isApiNotFoundError } from 'lib/student-dashboard/normalizers';
import { useStudentWorkspaceUser } from 'lib/student-dashboard/student-workspace-user-context';
import {
  AttachDocumentSection,
  AttachedDocumentsSection,
  DocumentCompletenessSection,
  EligibilitySignalsSection,
  NeedsInfoThreadSection,
  OverviewSection,
  ReadOnlyStatusBanner,
  SectionsEditorSection,
  SubmissionActionsSection,
} from 'features/student-workspace/routes/application-detail-sections';

import { ProgramAProjectView } from 'features/student-workspace/routes/program-a-project-view';

import { isProgramAProjectStatus } from 'features/student-workspace/lib/program-a-project';

const FORBIDDEN_STATUS = 403;

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function StudentApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const me = useStudentWorkspaceUser();
  const [resubmitNote, setResubmitNote] = useState('');

  const applicationQuery = useApplicationsControllerFindById(id, {
    query: { enabled: true },
  });
  const teamQuery = useTeamControllerFindCurrentForUser({
    query: { enabled: Boolean(me), retry: false },
  });
  const hasTeamLoadError = teamQuery.isError && !isApiNotFoundError(teamQuery.error);
  const team = isApiNotFoundError(teamQuery.error) ? null : (teamQuery.data ?? null);
  const isLead = Boolean(
    me &&
    team &&
    applicationQuery.data &&
    team.id === applicationQuery.data.teamId &&
    team.leaderId === me.id,
  );
  const applicationStatus = applicationQuery.data?.status;
  const isProjectView = isProgramAProjectStatus(applicationStatus);
  const shouldLoadEditableApplicationData = Boolean(applicationStatus) && !isProjectView;

  const completenessQuery = useApplicationsControllerGetDocumentCompleteness(id, {
    query: { enabled: shouldLoadEditableApplicationData },
  });

  const documentsQuery = useApplicationsControllerListDocuments(id, {
    query: { enabled: shouldLoadEditableApplicationData },
  });

  const eligibilityQuery = useApplicationsControllerGetEligibilitySignals(id, {
    query: { enabled: shouldLoadEditableApplicationData },
  });

  const needsInfoQuery = useApplicationsControllerGetNeedsInfoThread(id, {
    query: { enabled: shouldLoadEditableApplicationData },
  });

  const sectionsQuery = useApplicationsControllerListSections(id, {
    query: { enabled: Boolean(applicationStatus) },
  });

  const mentorshipNotesQuery = useApplicationsControllerListMentorshipNotes(id, {
    query: { enabled: isProjectView },
  });

  const requiredDocumentsQuery = useCallsDocumentsControllerGetRequiredDocuments(
    applicationQuery.data?.callId ?? '',
    {
      query: {
        enabled: Boolean(applicationQuery.data?.callId) && shouldLoadEditableApplicationData,
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

  if (applicationQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title={t`Loading application`}
          description={t`Resolving your student session and Program A application detail.`}
        />
      </main>
    );
  }

  if (applicationQuery.isError) {
    const applicationError = applicationQuery.error;
    const notFound = isApiNotFoundError(applicationError);
    const isForbidden =
      isApiRequestError(applicationError) && applicationError.status === FORBIDDEN_STATUS;
    let errorTitle = t`Unable to load application`;
    let errorDescription = getErrorMessage(
      applicationError,
      t`The application detail request failed. Retry the request and confirm that the application is still available.`,
    );

    if (notFound) {
      errorTitle = t`Application not found`;
      errorDescription = t`This application does not exist or is no longer available.`;
    } else if (isForbidden) {
      errorTitle = t`Access denied`;
      errorDescription = t`Your account cannot access this application.`;
    }

    return (
      <StudentPageShell
        title={t`Program A application`}
        description={t`Application details are available only for applications your team can access.`}
      >
        <StudentStatusCard title={errorTitle} description={errorDescription} />
        {notFound || isForbidden ? null : (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => void applicationQuery.refetch()}>
              {t`Retry`}
            </Button>
          </div>
        )}
      </StudentPageShell>
    );
  }

  const application = applicationQuery.data;

  if (!application) {
    return null;
  }
  if (isProgramAProjectStatus(application.status)) {
    return (
      <ProgramAProjectView
        application={application}
        mentorshipNotesQuery={mentorshipNotesQuery}
        sectionsQuery={sectionsQuery}
        getErrorMessage={getErrorMessage}
      />
    );
  }

  const isEditableStatus = application.status === 'DRAFT' || application.status === 'NEEDS_INFO';

  // A NEEDS_INFO application can only be resubmitted once every OPEN request has
  // at least one reply. Until the thread has actually loaded we treat it as
  // unresolved so resubmit stays blocked (avoids a premature "allowed" state).
  const needsInfoThreadLoaded = Boolean(needsInfoQuery.data);
  const needsInfoItems = needsInfoQuery.data?.items ?? [];
  const hasOpenUnansweredItems = needsInfoItems.some(
    (item) => item.status === 'OPEN' && item.replies.length === 0,
  );
  // Block resubmit while the thread is still loading or has unanswered items.
  const resubmitBlocked =
    application.status === 'NEEDS_INFO' && (!needsInfoThreadLoaded || hasOpenUnansweredItems);

  const canSubmitApplication = isLead && application.status === 'DRAFT';
  const canResubmitApplication = isLead && application.status === 'NEEDS_INFO' && !resubmitBlocked;

  return (
    <StudentPageShell
      title={t`Program A application`}
      description={t`Review your application details, required documents, eligibility checks, and messages from the NTI team.`}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <OverviewSection application={application} />
        {isEditableStatus ? (
          <SubmissionActionsSection
            canResubmit={canResubmitApplication}
            canSubmit={canSubmitApplication}
            hasTeamLoadError={hasTeamLoadError}
            isLead={isLead}
            resubmitBlocked={resubmitBlocked}
            onRetryTeam={() => void teamQuery.refetch()}
            onSubmit={async () => {
              try {
                await submitApplication.mutateAsync({ id });
                await Promise.all([
                  applicationQuery.refetch(),
                  completenessQuery.refetch(),
                  eligibilityQuery.refetch(),
                ]);
                toast.success(t`Application submitted.`);
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : t`Unable to submit the application.`,
                );
              }
            }}
            onResubmit={async () => {
              const payload = resubmitNote.trim() ? { note: resubmitNote.trim() } : {};

              try {
                await resubmitApplication.mutateAsync({
                  id,
                  data: payload as Record<string, unknown>,
                });
                await Promise.all([
                  applicationQuery.refetch(),
                  needsInfoQuery.refetch(),
                  completenessQuery.refetch(),
                  eligibilityQuery.refetch(),
                ]);
                setResubmitNote('');
                toast.success(t`Application resubmitted.`);
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : t`Unable to resubmit the application.`,
                );
              }
            }}
            isSubmitPending={submitApplication.isPending}
            isResubmitPending={resubmitApplication.isPending}
            resubmitNote={resubmitNote}
            setResubmitNote={setResubmitNote}
            teamErrorMessage={getErrorMessage(
              teamQuery.error,
              t`The current team context could not be loaded, so lead-only actions remain unavailable until this is retried.`,
            )}
          />
        ) : (
          <ReadOnlyStatusBanner status={application.status} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentCompletenessSection
          completenessQuery={completenessQuery}
          requiredDocumentsQuery={requiredDocumentsQuery}
          getErrorMessage={getErrorMessage}
        />
        <EligibilitySignalsSection
          eligibilityQuery={eligibilityQuery}
          getErrorMessage={getErrorMessage}
        />
      </div>

      <SectionsEditorSection
        applicationId={id}
        canEdit={canSubmitApplication || canResubmitApplication}
        sectionsQuery={sectionsQuery}
        getErrorMessage={getErrorMessage}
      />

      {isEditableStatus ? (
        <AttachDocumentSection
          applicationId={id}
          isLead={isLead}
          members={team?.members ?? []}
          attachDocument={attachDocument}
          requestUploadUrl={requestUploadUrl}
          uploadToPresignedUrl={uploadToPresignedUrl}
          completeUpload={completeUpload}
          onAttached={async () => {
            await Promise.all([
              completenessQuery.refetch(),
              eligibilityQuery.refetch(),
              applicationQuery.refetch(),
              documentsQuery.refetch(),
            ]);
          }}
        />
      ) : null}

      <AttachedDocumentsSection
        documentsQuery={documentsQuery}
        requestDownload={(documentId) =>
          applicationsControllerRequestDocumentDownloadUrl(id, documentId)
        }
      />

      <NeedsInfoThreadSection
        applicationId={id}
        isLead={isLead}
        needsInfoQuery={needsInfoQuery}
        replyToNeedsInfo={replyToNeedsInfo}
        getErrorMessage={getErrorMessage}
      />
    </StudentPageShell>
  );
}
