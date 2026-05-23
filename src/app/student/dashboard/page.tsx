'use client';

import { t } from '@lingui/core/macro';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';

import {
  ApplicationsControllerListActivePublicCallsType,
  useApplicationsControllerCreateDraft,
  useApplicationsControllerListActivePublicCalls,
  useGetMyStudentProfile,
  useProgramBBacklogControllerListPublished,
  useProgramBProjectsControllerListMy,
  useTeamControllerFindCurrentForUser,
} from 'lib/api';
import {
  FoundationSection,
  NextStepsSection,
  ProgramASection,
  ProgramBSection,
  TeamLoadErrorState,
  StudentDashboardShell,
} from 'features/student-workspace/routes/dashboard-sections';
import { ROUTES } from 'lib/constants';
import {
  saveDraftRegistryEntry,
  useDraftRegistryStore,
} from 'lib/student-dashboard/draft-registry';
import { formatUnknownDate, isApiNotFoundError } from 'lib/student-dashboard/normalizers';
import { useStudentWorkspaceUser } from 'lib/student-dashboard/student-workspace-user-context';

const PROGRAM_B_PROJECT_PREVIEW_LIMIT = 3;
const PROGRAM_B_BACKLOG_PREVIEW_LIMIT = 3;

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

      <div className="grid gap-6 xl:grid-cols-2">
        <ProgramASection
          activeCalls={activeCalls}
          createDraft={createDraft}
          draftEntries={draftEntries}
          draftRegistryMap={draftRegistryMap}
          handleCreateDraft={handleCreateDraft}
          isLead={isLead}
          isLocked={isLocked}
          team={team}
        />
        <ProgramBSection backlogPreview={backlogPreview} projectPreview={projectPreview} />
      </div>
    </StudentDashboardShell>
  );
}
