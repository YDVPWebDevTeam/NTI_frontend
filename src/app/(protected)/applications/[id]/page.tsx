'use client';

import { use, useState } from 'react';
import { toast } from 'sonner';

import {
  UserRole,
  useApplicationsControllerAttachDocument,
  useApplicationsControllerFindById,
  useApplicationsControllerGetDocumentCompleteness,
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

import { StudentPageShell, StudentStatusCard } from 'components/student-dashboard/page-shell';
import { useUploadToPresignedUrl } from 'lib/api-client/openapi-runtime/file-upload';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { isApiNotFoundError } from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
import {
  AttachDocumentSection,
  DocumentCompletenessSection,
  EligibilitySignalsSection,
  NeedsInfoThreadSection,
  OverviewSection,
  SectionsEditorSection,
  SubmissionActionsSection,
} from './application-detail-sections';

const FORBIDDEN_STATUS = 403;

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me, isLoading } = useAuthenticatedUser([UserRole.STUDENT]);
  const [resubmitNote, setResubmitNote] = useState('');

  const applicationQuery = useApplicationsControllerFindById(id, {
    query: { enabled: !isLoading },
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
  const completenessQuery = useApplicationsControllerGetDocumentCompleteness(id, {
    query: { enabled: !isLoading },
  });
  const eligibilityQuery = useApplicationsControllerGetEligibilitySignals(id, {
    query: { enabled: !isLoading },
  });
  const needsInfoQuery = useApplicationsControllerGetNeedsInfoThread(id, {
    query: { enabled: !isLoading },
  });
  const sectionsQuery = useApplicationsControllerListSections(id, {
    query: { enabled: !isLoading },
  });
  const requiredDocumentsQuery = useCallsDocumentsControllerGetRequiredDocuments(
    applicationQuery.data?.callId ?? '',
    { query: { enabled: Boolean(applicationQuery.data?.callId) } },
  );

  const requestUploadUrl = useFilesControllerRequestUploadUrl();
  const uploadToPresignedUrl = useUploadToPresignedUrl();
  const completeUpload = useFilesControllerCompleteUpload();
  const attachDocument = useApplicationsControllerAttachDocument();
  const submitApplication = useApplicationsControllerSubmit();
  const replyToNeedsInfo = useApplicationsControllerReplyToNeedsInfoItem();
  const resubmitApplication = useApplicationsControllerResubmit();

  if (isLoading || applicationQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title="Loading application"
          description="Resolving your student session and Program A application detail."
        />
      </main>
    );
  }

  if (applicationQuery.isError) {
    const applicationError = applicationQuery.error;
    const notFound = isApiNotFoundError(applicationError);
    const isForbidden =
      isApiRequestError(applicationError) && applicationError.status === FORBIDDEN_STATUS;
    let errorTitle = 'Unable to load application';
    let errorDescription = getErrorMessage(
      applicationError,
      'The application detail request failed. Retry the request and confirm that the application is still available.',
    );

    if (notFound) {
      errorTitle = 'Application not found';
      errorDescription = 'This application does not exist or is no longer available.';
    } else if (isForbidden) {
      errorTitle = 'Access denied';
      errorDescription = 'Your account cannot access this application.';
    }

    return (
      <StudentPageShell
        title="Program A application"
        description="Application detail needs a valid accessible application before the rest of the workflow can render."
      >
        <StudentStatusCard title={errorTitle} description={errorDescription} />
        {notFound || isForbidden ? null : (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => void applicationQuery.refetch()}>
              Retry
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

  return (
    <StudentPageShell
      title={`Application ${application.id}`}
      description="Generated Program A detail shell with sections, document completeness, eligibility signals, needs-info thread, and lead-only submit or resubmit actions."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <OverviewSection application={application} />
        <SubmissionActionsSection
          hasTeamLoadError={hasTeamLoadError}
          isLead={isLead}
          onRetryTeam={() => void teamQuery.refetch()}
          onSubmit={async () => {
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
          onResubmit={async () => {
            const payload = resubmitNote.trim() ? { note: resubmitNote.trim() } : {};

            try {
              await resubmitApplication.mutateAsync({
                id,
                data: payload as Record<string, unknown>,
              });
              await Promise.all([applicationQuery.refetch(), needsInfoQuery.refetch()]);
              toast.success('Application resubmitted.');
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : 'Unable to resubmit the application.',
              );
            }
          }}
          isSubmitPending={submitApplication.isPending}
          isResubmitPending={resubmitApplication.isPending}
          resubmitNote={resubmitNote}
          setResubmitNote={setResubmitNote}
          teamErrorMessage={getErrorMessage(
            teamQuery.error,
            'The current team context could not be loaded, so lead-only actions remain unavailable until this is retried.',
          )}
        />
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
        canEdit={isLead}
        sectionsQuery={sectionsQuery}
        getErrorMessage={getErrorMessage}
      />

      <AttachDocumentSection
        applicationId={id}
        isLead={isLead}
        attachDocument={attachDocument}
        requestUploadUrl={requestUploadUrl}
        uploadToPresignedUrl={uploadToPresignedUrl}
        completeUpload={completeUpload}
        onAttached={async () => {
          await completenessQuery.refetch();
        }}
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
