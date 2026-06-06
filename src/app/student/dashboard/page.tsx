'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';

import {
  ApplicationsControllerListActivePublicCallsType,
  type StudentApplicationSummaryDto,
  useApplicationsControllerCreateDraft,
  useApplicationsControllerListSubmittedForCurrentTeam,
  useApplicationsControllerListActivePublicCalls,
  useGetMyStudentProfile,
  useProgramBBacklogControllerListPublished,
  useProgramBProjectsControllerListMy,
  useTeamControllerFindCurrentForUser,
} from 'lib/api';
import { Button } from 'components/shadcn';
import { ProgramAStatusBadge } from 'features/admin-program-a/components/program-a-status-badge';
import {
  FoundationSection,
  NextStepsSection,
  ProgramASection,
  ProgramBSection,
  StudentDashboardShell,
  TeamLoadErrorState,
} from 'features/student-workspace/routes/dashboard-sections';
import { isProgramAProjectStatus } from 'features/student-workspace/lib/program-a-project';
import {
  StudentKeyValueList,
  StudentSectionCard,
} from 'components/student-dashboard/page-shell-primitives';
import { ROUTES } from 'lib/constants';
import {
  saveDraftRegistryEntry,
  useDraftRegistryStore,
} from 'lib/student-dashboard/draft-registry';
import { formatUnknownDate, isApiNotFoundError } from 'lib/student-dashboard/normalizers';
import { useStudentWorkspaceUser } from 'lib/student-dashboard/student-workspace-user-context';

const PROGRAM_B_PROJECT_PREVIEW_LIMIT = 3;
const PROGRAM_B_BACKLOG_PREVIEW_LIMIT = 3;

function MyApplicationsSection({
  applications,
  isLoading,
  isError,
  onRetry,
}: {
  applications: StudentApplicationSummaryDto[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const needsInfoApplication = applications.find(
    (application) => application.status === 'NEEDS_INFO',
  );

  const renderApplicationsContent = () => {
    if (isLoading) {
      return (
        <p className="text-sm leading-7 text-[#58667d]">
          {t`Loading your submitted applications...`}
        </p>
      );
    }

    if (isError) {
      return (
        <div className="space-y-3 rounded-[1.5rem] bg-[#f8faff] p-5">
          <p className="text-sm leading-7 text-[#58667d]">
            {t`Submitted applications could not be loaded right now.`}
          </p>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {t`Retry`}
          </Button>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="rounded-[1.5rem] bg-[#f8faff] p-5">
          <p className="text-sm leading-7 text-[#58667d]">{t`No submitted applications yet.`}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application.id}
            className="rounded-[1.5rem] border border-[#dce5fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#122039]">{application.call.title}</p>

                <div className="mt-3">
                  <StudentKeyValueList
                    items={[
                      {
                        label: t`Submitted`,
                        value: application.submittedAt
                          ? formatUnknownDate(application.submittedAt)
                          : t`Not submitted`,
                      },
                      {
                        label: t`Updated`,
                        value: formatUnknownDate(application.updatedAt),
                      },
                    ]}
                  />
                </div>
              </div>

              <ProgramAStatusBadge status={application.status} />
            </div>

            <div className="mt-4">
              <Button asChild size="sm" variant="outline">
                <Link href={ROUTES.STUDENT.studentApplication(application.id)}>
                  {t`View details`}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {needsInfoApplication ? (
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 shadow-[0_14px_36px_rgba(19,27,46,0.05)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-amber-700 uppercase">
                {t`Action required`}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#101a2e]">
                {t`Your application needs additional information`}
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                {t`Open the application detail and reply to the needs-info request.`}
              </p>
            </div>

            <Button asChild size="sm">
              <Link href={ROUTES.STUDENT.studentApplication(needsInfoApplication.id)}>
                {t`Open application`}
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <StudentSectionCard
        title={t`My Applications`}
        description={t`Submitted Program A applications for your current team.`}
      >
        {renderApplicationsContent()}
      </StudentSectionCard>
    </div>
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const me = useStudentWorkspaceUser();

  const profileQuery = useGetMyStudentProfile({
    query: { enabled: true },
  });

  const teamQuery = useTeamControllerFindCurrentForUser({
    query: {
      retry: false,
    },
  });

  const backlogQuery = useProgramBBacklogControllerListPublished(
    {
      limit: PROGRAM_B_BACKLOG_PREVIEW_LIMIT,
      page: 1,
      sort: 'updatedAt',
      order: 'desc',
    },
    {
      query: { enabled: true },
    },
  );

  const projectsQuery = useProgramBProjectsControllerListMy({
    query: { enabled: true },
  });

  const callsQuery = useApplicationsControllerListActivePublicCalls(
    {
      limit: 4,
      page: 1,
      type: ApplicationsControllerListActivePublicCallsType.PROGRAM_A,
      sort: 'closesAt',
      order: 'asc',
    },
    {
      query: { enabled: true },
    },
  );

  const applicationsQuery = useApplicationsControllerListSubmittedForCurrentTeam({
    query: {
      enabled: true,
      retry: false,
    },
  });

  const createDraft = useApplicationsControllerCreateDraft();
  const draftRegistryEntries = useDraftRegistryStore((state) => state.entries);

  const hasNoTeam = isApiNotFoundError(teamQuery.error);
  const hasTeamLoadError = teamQuery.isError && !hasNoTeam;
  const team = hasNoTeam ? null : (teamQuery.data ?? null);
  const isLead = Boolean(team && team.leaderId === me.id);
  const isLocked = Boolean(team?.lockedAt);

  const draftEntries = useMemo(() => {
    const entries = Object.values(draftRegistryEntries);

    if (!team?.id) {
      return entries;
    }

    return entries.filter((entry) => entry.teamId === team.id);
  }, [draftRegistryEntries, team?.id]);

  const draftRegistryMap = useMemo(
    () => new Map(draftEntries.map((entry) => [entry.callId, entry])),
    [draftEntries],
  );

  if (hasTeamLoadError) {
    return <TeamLoadErrorState onRetry={() => void teamQuery.refetch()} />;
  }

  const profile = profileQuery.data;
  const backlogPreview = backlogQuery.data?.data ?? [];
  const projectPreview = (projectsQuery.data ?? []).slice(0, PROGRAM_B_PROJECT_PREVIEW_LIMIT);
  const activeCalls = callsQuery.data?.data ?? [];
  const submittedApplications = applicationsQuery.data ?? [];
  const programAProjectApplications = submittedApplications.filter(
    (application) =>
      application.call.type === 'PROGRAM_A' && isProgramAProjectStatus(application.status),
  );

  let teamAccessLabel = t`No team`;
  let teamLockLabel: string | null = null;

  if (team) {
    teamAccessLabel = isLead ? t`Leader` : t`Member`;
    teamLockLabel = isLocked ? t`Locked since ${formatUnknownDate(team.lockedAt)}` : null;
  }

  const handleCreateDraft = async (callId: string) => {
    if (!team) {
      toast.error(t`Create a team before starting a Program A draft.`);

      return;
    }

    try {
      const application = await createDraft.mutateAsync({
        data: {
          callId,
          teamId: team.id,
        },
      });

      saveDraftRegistryEntry(application.id, team.id, callId);
      router.push(ROUTES.STUDENT.studentApplication(application.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Unable to create a draft application.`,
      );
    }
  };

  return (
    <StudentDashboardShell team={team}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FoundationSection
          profile={profile}
          teamAccessLabel={teamAccessLabel}
          teamLockLabel={teamLockLabel}
        />
        <NextStepsSection />
      </div>

      <MyApplicationsSection
        applications={submittedApplications}
        isError={applicationsQuery.isError}
        isLoading={applicationsQuery.isLoading}
        onRetry={() => void applicationsQuery.refetch()}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProgramASection
          activeCalls={activeCalls}
          createDraft={createDraft}
          draftEntries={draftEntries}
          draftRegistryMap={draftRegistryMap}
          handleCreateDraft={handleCreateDraft}
          isLead={isLead}
          isLocked={isLocked}
          projectApplications={programAProjectApplications}
          team={team}
        />
        <ProgramBSection backlogPreview={backlogPreview} projectPreview={projectPreview} />
      </div>
    </StudentDashboardShell>
  );
}
