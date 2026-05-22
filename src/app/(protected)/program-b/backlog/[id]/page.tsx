'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

import {
  UserRole,
  useProgramBBacklogControllerFindPublishedById,
  useProgramBBacklogControllerRequestDocumentDownload,
  useProgramBTeamApplicationControllerGetMy,
  useProgramBTeamApplicationControllerSubmit,
  useProgramBTeamApplicationWithdrawalControllerWithdraw,
  useTeamControllerFindCurrentForUser,
} from 'lib/api';
import { Button, Input, Textarea } from 'components/shadcn';
import {
  StudentPageShell,
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell';
import { ROUTES } from 'lib/constants';
import {
  formatUnknownDate,
  isApiNotFoundError,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

export default function ProgramBBacklogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { me, isLoading } = useAuthenticatedUser([UserRole.STUDENT]);
  const [motivation, setMotivation] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [cvFileIds, setCvFileIds] = useState('');

  const backlogItemQuery = useProgramBBacklogControllerFindPublishedById(id, {
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
  const isLead = Boolean(me && team && team.leaderId === me.id);
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

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title="Loading backlog item"
          description="Resolving your student session and backlog item."
        />
      </main>
    );
  }

  const item = backlogItemQuery.data;
  const existingApplication = isApiNotFoundError(myApplicationQuery.error)
    ? null
    : (myApplicationQuery.data ?? null);
  let teamApplicationContent = (
    <p className="text-sm text-neutral-600">
      Only the current team lead can apply or withdraw for Program B opportunities.
    </p>
  );

  if (existingApplication) {
    teamApplicationContent = (
      <div className="space-y-4">
        <p className="text-sm text-neutral-700">
          Current status:{' '}
          <span className="font-semibold text-neutral-950">{existingApplication.status}</span>
        </p>
        <p className="text-sm text-neutral-700">
          Submitted:{' '}
          <span className="font-semibold text-neutral-950">
            {formatUnknownDate(existingApplication.submittedAt)}
          </span>
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={!isLead || withdrawApplication.isPending}
          onClick={async () => {
            try {
              await withdrawApplication.mutateAsync({
                applicationId: existingApplication.id,
              });

              await myApplicationQuery.refetch();
              toast.success('Application withdrawn.');
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : 'Unable to withdraw the application.',
              );
            }
          }}
        >
          Withdraw application
        </Button>
      </div>
    );
  } else if (isLead) {
    teamApplicationContent = (
      <div className="space-y-4">
        <Textarea
          value={motivation}
          onChange={(event) => setMotivation(event.target.value)}
          placeholder="Motivation"
          rows={4}
        />
        <Textarea
          value={proposalText}
          onChange={(event) => setProposalText(event.target.value)}
          placeholder="Proposal text"
          rows={5}
        />
        <Input
          value={cvFileIds}
          onChange={(event) => setCvFileIds(event.target.value)}
          placeholder="Comma-separated CV file ids"
        />
        <Button
          disabled={
            !team || !motivation.trim() || !proposalText.trim() || submitApplication.isPending
          }
          onClick={async () => {
            if (!team) {
              return;
            }

            try {
              await submitApplication.mutateAsync({
                backlogItemId: id,
                data: {
                  teamId: team.id,
                  motivation: motivation.trim(),
                  proposalText: proposalText.trim(),
                  cvFileIds: cvFileIds
                    .split(',')
                    .map((entry) => entry.trim())
                    .filter(Boolean),
                },
              });

              await myApplicationQuery.refetch();
              toast.success('Team application submitted.');
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Unable to submit the team application right now.',
              );
            }
          }}
        >
          Submit application
        </Button>
      </div>
    );
  }

  return (
    <StudentPageShell
      title={normalizeUnknownText(item?.title) ?? 'Program B backlog item'}
      description={
        normalizeUnknownText(item?.description) ?? 'Published Program B opportunity detail.'
      }
    >
      <StudentSectionCard title="Overview">
        <div className="space-y-3 text-sm text-neutral-700">
          <p>
            Status: <span className="font-medium text-neutral-950">{item?.status}</span>
          </p>
          <p>
            Budget:{' '}
            <span className="font-medium text-neutral-950">
              {normalizeUnknownText(item?.budget) ?? 'Not specified'}
            </span>
          </p>
          <p>
            Expected outcomes:{' '}
            <span className="font-medium text-neutral-950">
              {normalizeUnknownText(item?.expectedOutcomes) ?? 'Not specified'}
            </span>
          </p>
          <p>
            Last updated:{' '}
            <span className="font-medium text-neutral-950">
              {item ? formatUnknownDate(item.updatedAt) : 'Not available'}
            </span>
          </p>
        </div>
      </StudentSectionCard>

      <StudentSectionCard title="Documents">
        <div className="space-y-3">
          {(item?.documents ?? []).map((document) => (
            <div
              key={document.id}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-neutral-950">{document.name}</p>
                <p className="text-sm text-neutral-600">
                  {document.category} · {document.status}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    const download = await downloadDocument.mutateAsync({
                      id,
                      documentId: document.id,
                    });

                    window.open(download.downloadUrl, '_blank', 'noopener,noreferrer');
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : 'Unable to open the document.',
                    );
                  }
                }}
              >
                Open document
              </Button>
            </div>
          ))}
        </div>
      </StudentSectionCard>

      <StudentSectionCard
        title="Team application"
        description="Lead-only apply and withdraw actions use the generated team application endpoints."
      >
        {teamApplicationContent}
      </StudentSectionCard>

      <Button asChild variant="outline" size="sm">
        <Link href={ROUTES.PROGRAM_B_BACKLOG}>Back to backlog</Link>
      </Button>
    </StudentPageShell>
  );
}
