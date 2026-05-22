'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';

import {
  type ApplicationsControllerListActivePublicCallsQueryResult,
  ApplicationsControllerListActivePublicCallsType,
  type AuthenticatedUserDto,
  type GetMyStudentProfileResponseDto,
  type ProgramBBacklogControllerListPublishedQueryResult,
  type ProgramBProjectsControllerListMyQueryResult,
  type TeamDetailDto,
  UserRole,
  useApplicationsControllerCreateDraft,
  useApplicationsControllerListActivePublicCalls,
  useGetMyStudentProfile,
  useProgramBBacklogControllerListPublished,
  useProgramBProjectsControllerListMy,
  useTeamControllerFindCurrentForUser,
} from 'lib/api';
import OrganizationInviteDashboard from 'components/organization-dashboard/organization-invite-dashboard';
import { Button } from 'components/shadcn';
import {
  StudentKeyValueList,
  StudentPageShell,
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell';
import { ROUTES } from 'lib/constants';
import {
  type DraftRegistryEntry,
  saveDraftRegistryEntry,
  useDraftRegistryStore,
} from 'lib/student-dashboard/draft-registry';
import {
  formatUnknownDate,
  isApiNotFoundError,
  normalizeUnknownText,
} from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
import { isOrganizationRole, isStudentRole } from 'lib/student-dashboard/access';

const PROGRAM_B_PROJECT_PREVIEW_LIMIT = 3;
const PROGRAM_B_BACKLOG_PREVIEW_LIMIT = 3;

function OrganizationDashboardPlaceholder({ role }: { role: AuthenticatedUserDto['role'] }) {
  if (role !== UserRole.COMPANY_OWNER) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-8">
        <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
            Organization dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Invitation management is available only to the company owner account. Your current role
            is <span className="font-semibold text-neutral-900">{role}</span>.
          </p>
        </section>
      </main>
    );
  }

  return <OrganizationInviteDashboard />;
}

function SafeFallback({ role }: { role: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-8">
      <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          The current dashboard branch is focused on student workflows. Your authenticated role is{' '}
          <span className="font-semibold text-neutral-900">{role}</span>, so no student-only
          workspace is rendered here.
        </p>
      </section>
    </main>
  );
}

function DashboardHeaderActions({ team }: { team: { id: string } | null }) {
  return (
    <>
      <Button asChild variant="outline">
        <Link href={ROUTES.PROFILE}>{t`Edit profile`}</Link>
      </Button>
      <Button asChild>
        <Link href={ROUTES.TEAM}>{team ? t`Open team workspace` : t`Set up team`}</Link>
      </Button>
    </>
  );
}

function FoundationSection({
  profile,
  teamAccessLabel,
  teamLockLabel,
}: {
  profile: GetMyStudentProfileResponseDto | undefined;
  teamAccessLabel: string;
  teamLockLabel: string | null;
}) {
  return (
    <StudentSectionCard
      title={t`Foundation`}
      description={t`Everything that affects access across the rest of the student area.`}
    >
      <div className="space-y-5">
        <StudentKeyValueList
          items={[
            {
              label: t`Profile status`,
              value: profile?.completion.profileCompleted ? t`Complete` : t`Incomplete`,
            },
            {
              label: t`Academic section`,
              value: profile?.completion.academicInformationCompleted
                ? t`Complete`
                : t`Needs attention`,
            },
            {
              label: t`Skills section`,
              value: profile?.completion.professionalSkillsCompleted
                ? t`Complete`
                : t`Needs attention`,
            },
            { label: t`Team access`, value: teamAccessLabel },
            ...(teamLockLabel ? [{ label: t`Team lock`, value: teamLockLabel }] : []),
          ]}
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.PROFILE}>{t`Open profile`}</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.TEAM}>{t`Open team`}</Link>
          </Button>
        </div>
      </div>
    </StudentSectionCard>
  );
}

function NextStepsSection() {
  return (
    <StudentSectionCard
      title={t`Next steps`}
      description={t`The fastest actions to keep the workflow moving.`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[#dce5fb] bg-[#f8faff] p-5">
          <p className="text-sm font-semibold text-[#122039]">Complete foundation setup</p>
          <p className="mt-2 text-sm leading-7 text-[#58667d]">
            Finish profile details and keep team membership current so application actions stay
            available.
          </p>
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href={ROUTES.PROFILE}>Review setup</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-[#dce5fb] bg-[#f8faff] p-5">
          <p className="text-sm font-semibold text-[#122039]">Move into program work</p>
          <p className="mt-2 text-sm leading-7 text-[#58667d]">
            Program A is for draft and submission flow. Program B is for opportunity pairing and
            project delivery.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.PROGRAM_B_BACKLOG}>Program B backlog</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.TEAM}>Team readiness</Link>
            </Button>
          </div>
        </div>
      </div>
    </StudentSectionCard>
  );
}

function ProgramASection({
  activeCalls,
  createDraft,
  draftEntries,
  draftRegistryMap,
  handleCreateDraft,
  isLead,
  isLocked,
  team,
}: {
  activeCalls: ApplicationsControllerListActivePublicCallsQueryResult['data'];
  createDraft: ReturnType<typeof useApplicationsControllerCreateDraft>;
  draftEntries: DraftRegistryEntry[];
  draftRegistryMap: Map<string, DraftRegistryEntry>;
  handleCreateDraft: (callId: string) => Promise<void>;
  isLead: boolean;
  isLocked: boolean;
  team: TeamDetailDto | null;
}) {
  return (
    <StudentSectionCard
      title={t`Program A flow`}
      description={t`Open calls, draft recovery, and application-start actions live here.`}
    >
      <div className="space-y-4">
        {activeCalls.map((call) => {
          const draftEntry = team ? (draftRegistryMap.get(call.id) ?? null) : null;

          return (
            <div
              key={call.id}
              className="rounded-[1.5rem] border border-[#dce5fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#122039]">{call.title}</p>
                  <p className="mt-1 text-sm text-[#5e6d86]">
                    Opens {call.opensAt ? formatUnknownDate(call.opensAt) : 'immediately'}
                  </p>
                </div>
                <span className="rounded-full bg-[#fff3e1] px-3 py-1 text-xs font-semibold text-[#a26200]">
                  {call.closesAt ? `Closes ${formatUnknownDate(call.closesAt)}` : 'No closing date'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {draftEntry ? (
                  <Button asChild size="sm">
                    <Link href={ROUTES.studentApplication(draftEntry.applicationId)}>
                      Continue draft
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={!isLead || !team || isLocked || createDraft.isPending}
                    onClick={() => void handleCreateDraft(call.id)}
                  >
                    Start draft
                  </Button>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link href={ROUTES.TEAM}>
                    {isLead ? 'Check team readiness' : 'View team access'}
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
        {activeCalls.length ? null : (
          <div className="rounded-[1.5rem] bg-[#f8faff] p-5">
            <p className="text-sm leading-7 text-[#58667d]">
              No active Program A calls are available right now.
            </p>
          </div>
        )}
        {isLead ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#d6e1fa] bg-white p-5">
            <p className="text-sm font-semibold text-[#122039]">Recovered drafts</p>
            <div className="mt-3 space-y-3">
              {draftEntries.length ? (
                draftEntries.map((entry) => (
                  <div
                    key={entry.applicationId}
                    className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#f6f8ff] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#122039]">
                        Call {entry.callId}
                      </p>
                      <p className="text-xs text-[#66758f]">
                        Updated {formatUnknownDate(entry.updatedAt)}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={ROUTES.studentApplication(entry.applicationId)}>Open</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[#58667d]">No local Program A drafts yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </StudentSectionCard>
  );
}

function ProgramBSection({
  backlogPreview,
  projectPreview,
}: {
  backlogPreview: ProgramBBacklogControllerListPublishedQueryResult['data'];
  projectPreview: ProgramBProjectsControllerListMyQueryResult;
}) {
  return (
    <StudentSectionCard
      title="Program B flow"
      description="Discover opportunities first, then track accepted work as project delivery."
    >
      <div className="space-y-5">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold tracking-[0.16em] text-[#6f7f9a] uppercase">
              Opportunities
            </h3>
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.PROGRAM_B_BACKLOG}>Open backlog</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {backlogPreview.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.25rem] border border-[#dce5fb] bg-[#f8faff] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#122039]">
                      {normalizeUnknownText(item.title) ?? 'Untitled backlog item'}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-[#58667d]">
                      {normalizeUnknownText(item.description) ?? 'No description provided.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#0f4fb8]">
                    {item.status}
                  </span>
                </div>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={ROUTES.programBBacklogDetail(item.id)}>View details</Link>
                  </Button>
                </div>
              </div>
            ))}
            {backlogPreview.length ? null : (
              <p className="text-sm leading-7 text-[#58667d]">
                Published Program B opportunities will appear here once available.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-[0.16em] text-[#6f7f9a] uppercase">
            Active projects
          </h3>
          <div className="space-y-3">
            {projectPreview.map((project) => (
              <div
                key={project.id}
                className="rounded-[1.25rem] border border-[#dce5fb] bg-[#f8faff] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#122039]">
                      {normalizeUnknownText(project.backlogItem.title) ?? 'Project'}
                    </p>
                    <p className="mt-1 text-sm text-[#58667d]">Team {project.team.name}</p>
                  </div>
                  <span className="rounded-full bg-[#effaf7] px-3 py-1 text-xs font-semibold text-[#11785d]">
                    {project.status}
                  </span>
                </div>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={ROUTES.programBProjectDetail(project.id)}>Open project</Link>
                  </Button>
                </div>
              </div>
            ))}
            {projectPreview.length ? null : (
              <p className="text-sm leading-7 text-[#58667d]">No active Program B projects yet.</p>
            )}
          </div>
        </div>
      </div>
    </StudentSectionCard>
  );
}

function StudentDashboardContent({ me }: { me: AuthenticatedUserDto }) {
  const router = useRouter();
  const profileQuery = useGetMyStudentProfile();
  const teamQuery = useTeamControllerFindCurrentForUser({
    query: {
      retry: false,
    },
  });
  const backlogQuery = useProgramBBacklogControllerListPublished({
    limit: PROGRAM_B_BACKLOG_PREVIEW_LIMIT,
    page: 1,
    sort: 'updatedAt',
    order: 'desc',
  });
  const projectsQuery = useProgramBProjectsControllerListMy();
  const callsQuery = useApplicationsControllerListActivePublicCalls({
    limit: 4,
    page: 1,
    type: ApplicationsControllerListActivePublicCallsType.PROGRAM_A,
    sort: 'closesAt',
    order: 'asc',
  });
  const createDraft = useApplicationsControllerCreateDraft();

  const hasNoTeam = isApiNotFoundError(teamQuery.error);
  const hasTeamLoadError = teamQuery.isError && !hasNoTeam;
  const team = hasNoTeam ? null : (teamQuery.data ?? null);
  const isLead = Boolean(team && team.leaderId === me.id);
  const isLocked = Boolean(team?.lockedAt);
  const draftRegistryEntries = useDraftRegistryStore((state) => state.entries);
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
    return (
      <StudentPageShell
        title={t`Dashboard`}
        description={t`A lighter student workspace with separate flows for foundation setup, Program A applications, and Program B opportunities.`}
      >
        <div className="space-y-4">
          <StudentStatusCard
            title={t`Unable to load team data`}
            description={t`The current team could not be loaded right now. Retry the request instead of treating this as no team.`}
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

  const profile = profileQuery.data;
  const backlogPreview = backlogQuery.data?.data ?? [];
  const projectPreview = (projectsQuery.data ?? []).slice(0, PROGRAM_B_PROJECT_PREVIEW_LIMIT);
  const activeCalls = callsQuery.data?.data ?? [];
  let teamAccessLabel = t`No team`;
  let teamLockLabel: string | null = null;

  if (team) {
    teamAccessLabel = isLead ? t`Team lead` : t`Member`;
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
      router.push(ROUTES.studentApplication(application.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Unable to create a draft application.`,
      );
    }
  };

  return (
    <StudentPageShell
      title={t`Dashboard`}
      description={t`A lighter student workspace with separate flows for foundation setup, Program A applications, and Program B opportunities.`}
      actions={<DashboardHeaderActions team={team} />}
    >
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
    </StudentPageShell>
  );
}

export default function DashboardPage() {
  const { me, isLoading } = useAuthenticatedUser();

  if (isLoading || !me) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title={t`Loading dashboard`}
          description={t`Resolving your authenticated role and workspace.`}
        />
      </main>
    );
  }

  if (isOrganizationRole(me.role)) {
    return <OrganizationDashboardPlaceholder role={me.role} />;
  }

  if (!isStudentRole(me.role)) {
    return <SafeFallback role={me.role} />;
  }

  return <StudentDashboardContent me={me} />;
}
