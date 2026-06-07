'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

import {
  getProgramBBacklogControllerFindPublishedByIdQueryKey,
  getProgramBBacklogControllerListCandidatesQueryKey,
  getProgramBTeamApplicationControllerGetMyQueryKey,
  useProgramBBacklogControllerFindPublishedById,
  useProgramBBacklogControllerRequestDocumentDownload,
  useProgramBTeamApplicationControllerGetMy,
  useProgramBTeamApplicationControllerSubmit,
  useProgramBTeamApplicationWithdrawalControllerWithdraw,
  useTeamControllerFindCurrentForUser,
} from 'lib/api';
import { Button } from 'components/shadcn';
import {
  StudentPageShell,
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell-primitives';
import { ROUTES } from 'lib/constants';
import {
  formatUnknownDate,
  isApiNotFoundError,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { useStudentWorkspaceUser } from 'lib/student-dashboard/student-workspace-user-context';
import { useFileUploads } from 'components/files/file-uploader';
import {
  DocumentsSection,
  TeamApplicationSection,
} from 'features/student-workspace/routes/backlog-detail-sections';

export function StudentProgramBBacklogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const me = useStudentWorkspaceUser();
  const queryClient = useQueryClient();
  const [motivation, setMotivation] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const { uploadFiles, isUploading } = useFileUploads();

  const backlogItemQuery = useProgramBBacklogControllerFindPublishedById(id, {
    query: { enabled: true },
  });
  const teamQuery = useTeamControllerFindCurrentForUser({
    query: {
      enabled: Boolean(me),
      retry: false,
    },
  });
  const hasTeamLoadError = teamQuery.isError && !isApiNotFoundError(teamQuery.error);
  const team = isApiNotFoundError(teamQuery.error) ? null : (teamQuery.data ?? null);
  const isLead = Boolean(me && team && team.leaderId === me.id);
  const isLocked = Boolean(team?.lockedAt);
  const myApplicationQuery = useProgramBTeamApplicationControllerGetMy(
    id,
    {
      teamId: team?.id ?? '',
    },
    {
      query: {
        enabled: Boolean(team?.id && isLead),
        retry: false,
      },
    },
  );
  const downloadDocument = useProgramBBacklogControllerRequestDocumentDownload();
  const submitApplication = useProgramBTeamApplicationControllerSubmit();
  const withdrawApplication = useProgramBTeamApplicationWithdrawalControllerWithdraw();

  const refreshApplicationState = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getProgramBTeamApplicationControllerGetMyQueryKey(id, {
          teamId: team?.id ?? '',
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBBacklogControllerFindPublishedByIdQueryKey(id),
      }),
      queryClient.invalidateQueries({
        queryKey: getProgramBBacklogControllerListCandidatesQueryKey(id),
      }),
    ]);
  };

  if (hasTeamLoadError) {
    return (
      <StudentPageShell
        title={t`Program B backlog item`}
        description={t`Published Program B opportunity detail.`}
      >
        <div className="space-y-4">
          <StudentStatusCard
            title={t`Unable to load team data`}
            description={t`Your team data could not be loaded right now, so lead-only actions cannot be resolved.`}
          />
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => void teamQuery.refetch()}>
              {t`Retry`}
            </Button>
          </div>
        </div>
      </StudentPageShell>
    );
  }

  const item = backlogItemQuery.data;
  const existingApplication = isApiNotFoundError(myApplicationQuery.error)
    ? null
    : (myApplicationQuery.data ?? null);

  return (
    <StudentPageShell
      title={normalizeUnknownText(item?.title) ?? t`Program B backlog item`}
      description={
        normalizeUnknownText(item?.description) ?? t`Published Program B opportunity detail.`
      }
    >
      <StudentSectionCard title={t`Overview`}>
        <div className="text-muted-foreground space-y-3 text-sm">
          <p>
            {t`Status:`} <span className="text-foreground font-medium">{item?.status}</span>
          </p>
          <p>
            {t`Budget:`}{' '}
            <span className="text-foreground font-medium">
              {normalizeUnknownText(item?.budget) ?? t`Not specified`}
            </span>
          </p>
          <p>
            {t`Expected outcomes:`}{' '}
            <span className="text-foreground font-medium">
              {normalizeUnknownText(item?.expectedOutcomes) ?? t`Not specified`}
            </span>
          </p>
          <p>
            {t`Last updated:`}{' '}
            <span className="text-foreground font-medium">
              {item ? formatUnknownDate(item.updatedAt) : t`Not available`}
            </span>
          </p>
        </div>
      </StudentSectionCard>

      <DocumentsSection
        item={item}
        onOpenDocument={async (documentId) => {
          try {
            const download = await downloadDocument.mutateAsync({ id, documentId });

            window.open(download.downloadUrl, '_blank', 'noopener,noreferrer');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : t`Unable to open the document.`);
          }
        }}
      />

      <TeamApplicationSection
        existingApplication={existingApplication}
        isLead={isLead}
        isLocked={isLocked}
        team={team}
        motivation={motivation}
        proposalText={proposalText}
        cvFiles={cvFiles}
        setMotivation={setMotivation}
        setProposalText={setProposalText}
        setCvFiles={setCvFiles}
        onSubmit={async () => {
          if (!team) {
            return;
          }
          try {
            const uploadedCvs = await uploadFiles(cvFiles, {
              purpose: 'program-b-application-cv',
              entityType: 'program-b-team-application',
            });

            await submitApplication.mutateAsync({
              backlogItemId: id,
              data: {
                teamId: team.id,
                motivation: motivation.trim(),
                proposalText: proposalText.trim(),
                cvFileIds: uploadedCvs.map((file) => file.fileId),
              },
            });
            setMotivation('');
            setProposalText('');
            setCvFiles([]);
            await refreshApplicationState();
            toast.success(t`Team application submitted.`);
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : t`Unable to submit the team application right now.`,
            );
          }
        }}
        onWithdraw={async () => {
          if (!existingApplication) {
            return;
          }
          try {
            await withdrawApplication.mutateAsync({ applicationId: existingApplication.id });
            await refreshApplicationState();
            toast.success(t`Application withdrawn.`);
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : t`Unable to withdraw the application.`,
            );
          }
        }}
        isSubmitting={submitApplication.isPending || isUploading}
        isWithdrawing={withdrawApplication.isPending}
      />

      <Button asChild variant="outline" size="sm">
        <Link href={ROUTES.STUDENT.PROGRAM_B_BACKLOG}>{t`Back to backlog`}</Link>
      </Button>
    </StudentPageShell>
  );
}
