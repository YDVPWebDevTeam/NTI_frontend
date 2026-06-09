'use client';

import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  useGetMyStudentProfile,
  useInvitationControllerCreateInvites,
  useInvitationControllerListInvites,
  useInvitationControllerResendInvitation,
  useInvitationControllerRevokeInvitation,
  useTeamControllerCreate,
  useTeamControllerFindCurrentForUser,
  useTeamControllerLeaveTeam,
  useTeamControllerRemoveMember,
  useTeamControllerTransferLeadership,
  useTeamControllerUpdate,
} from 'lib/api';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';
import {
  getStudentJourneySteps,
  RegistrationStageHeader,
  StudentOnboardingStepper,
} from 'features/student-profile';
import { isApiNotFoundError } from 'lib/student-dashboard/normalizers';
import { useStudentWorkspaceUser } from 'lib/student-dashboard/student-workspace-user-context';
import { StudentPageShell, StudentSectionCard, StudentStatusCard } from './page-shell-primitives';
import {
  InvitationsSection,
  LeadershipTransferSection,
  MembersSection,
  TeamCreationSection,
  TeamLockBanner,
  TeamOverviewSection,
  type TeamWorkspaceMode,
} from './team-workspace-sections';

type TeamWorkspaceProps = {
  title: string;
  description: string;
};

function TeamWorkspaceView({
  mode,
  title,
  description,
}: TeamWorkspaceProps & { mode: TeamWorkspaceMode }) {
  const me = useStudentWorkspaceUser();
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [newLeaderId, setNewLeaderId] = useState('');
  const [justCreated, setJustCreated] = useState(false);

  const teamQuery = useTeamControllerFindCurrentForUser({
    query: {
      retry: false,
      enabled: Boolean(me),
    },
  });
  const profileQuery = useGetMyStudentProfile({
    query: { enabled: Boolean(me) },
  });
  const completion = profileQuery.data?.completion ?? null;
  const hasNoTeam = isApiNotFoundError(teamQuery.error);
  const hasTeamLoadError = teamQuery.isError && !hasNoTeam;
  const team = hasNoTeam ? null : (teamQuery.data ?? null);
  const isLead = Boolean(me && team && team.leaderId === me.id);
  const isLocked = Boolean(team?.lockedAt);
  const invitationsQuery = useInvitationControllerListInvites(
    team?.id ?? '',
    { limit: 20, page: 1, sort: 'createdAt', order: 'desc' },
    {
      query: {
        enabled: Boolean(team?.id && isLead),
      },
    },
  );

  const createTeam = useTeamControllerCreate();
  const renameTeam = useTeamControllerUpdate();
  const createInvites = useInvitationControllerCreateInvites();
  const resendInvite = useInvitationControllerResendInvitation();
  const revokeInvite = useInvitationControllerRevokeInvitation();
  const removeMember = useTeamControllerRemoveMember();
  const transferLeadership = useTeamControllerTransferLeadership();
  const leaveTeam = useTeamControllerLeaveTeam();

  const members = useMemo(() => team?.members ?? [], [team?.members]);
  const canManageTeam = mode === 'management';
  const canManageInvites = isLead;

  if (hasTeamLoadError) {
    return (
      <StudentPageShell title={title} description={description}>
        <div className="space-y-4">
          <StudentStatusCard
            title={t`Unable to load team workspace`}
            description={t`We couldn't load your team right now. Please try again.`}
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

  if (team === null) {
    // Detect & adapt: a student with no team sees the guided "build your team"
    // step. The shared journey stepper (academic → skills → team) makes this read
    // as the final onboarding step rather than a disconnected dashboard page.
    const journeySteps = completion ? getStudentJourneySteps(completion, false) : null;

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="border-border bg-muted flex w-full flex-col overflow-hidden rounded-xl border shadow-sm">
          {journeySteps ? (
            <StudentOnboardingStepper stages={journeySteps} activeStage="team" />
          ) : null}

          <section className="bg-background px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
            <RegistrationStageHeader
              title={t`Build your team`}
              description={t`Name your team and invite your teammates. You'll be added automatically as the team lead.`}
            />
            <div className="mt-8">
              <TeamCreationSection
                createTeam={createTeam}
                currentUserEmail={me?.email}
                inviteEmails={inviteEmails}
                setInviteEmails={setInviteEmails}
                setTeamName={setTeamName}
                teamName={teamName}
                teamQuery={teamQuery}
                onCreated={() => setJustCreated(true)}
              />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <StudentPageShell title={title} description={description}>
      <div className="space-y-6">
        {justCreated ? (
          <div className="border-success/30 bg-success/10 rounded-2xl border p-4">
            <p className="text-success font-semibold">{t`Team created`}</p>
            <p className="text-foreground mt-1 text-sm">
              {t`Your team is set up and invitations are on their way. Manage everything here, or head to your dashboard.`}
            </p>
            <div className="mt-3">
              <Button
                type="button"
                onClick={() => router.replace(ROUTES.STUDENT.DASHBOARD)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t`Go to dashboard`}
              </Button>
            </div>
          </div>
        ) : null}
        {isLocked ? <TeamLockBanner lockedAt={team.lockedAt} /> : null}
        {canManageTeam ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <TeamOverviewSection
                isLead={isLead}
                isLocked={isLocked}
                renameTeam={renameTeam}
                setTeamName={setTeamName}
                team={team}
                teamName={teamName}
                teamQuery={teamQuery}
              />
              <LeadershipTransferSection
                isLead={isLead}
                isLocked={isLocked}
                me={me}
                members={members}
                newLeaderId={newLeaderId}
                setNewLeaderId={setNewLeaderId}
                team={team}
                teamQuery={teamQuery}
                transferLeadership={transferLeadership}
              />
            </div>

            <MembersSection
              invitationsQuery={invitationsQuery}
              isLead={isLead}
              isLocked={isLocked}
              leaveTeam={leaveTeam}
              me={me}
              members={members}
              removeMember={removeMember}
              team={team}
              teamQuery={teamQuery}
            />
          </>
        ) : (
          <StudentSectionCard
            title={t`Invite teammates`}
            description={t`Once the team lead is ready, this step is for inviting teammates.`}
          >
            <div className="text-foreground space-y-3 text-sm">
              <p>
                {t`Team name:`} <span className="text-foreground font-semibold">{team.name}</span>
              </p>
              <p>
                {t`Lead access:`}{' '}
                <span className="text-foreground font-semibold">{isLead ? t`Yes` : t`No`}</span>
              </p>
              <p>
                {t`Locked state:`}{' '}
                <span className="text-foreground font-semibold">
                  {isLocked ? t`Locked` : t`Unlocked`}
                </span>
              </p>
              <p className="text-muted-foreground">
                {isLead
                  ? t`Invite teammates from here, then return to the dashboard once the roster looks right.`
                  : t`Only the current team lead can send invitations. Ask the lead to add the remaining teammates.`}
              </p>
            </div>
          </StudentSectionCard>
        )}

        {canManageInvites ? (
          <InvitationsSection
            createInvites={createInvites}
            inviteEmails={inviteEmails}
            invitationsQuery={invitationsQuery}
            isLocked={isLocked}
            resendInvite={resendInvite}
            revokeInvite={revokeInvite}
            setInviteEmails={setInviteEmails}
            team={team}
          />
        ) : null}
      </div>
    </StudentPageShell>
  );
}

export function TeamManagementWorkspace() {
  return (
    <TeamWorkspaceView
      mode="management"
      title={t`Team`}
      description={t`Non-leads stay read-only, while team leads can rename the team, manage invitations, remove members, and transfer leadership.`}
    />
  );
}

export function TeamInviteOnboardingWorkspace() {
  return (
    <TeamWorkspaceView
      mode="invite-onboarding"
      title={t`Team invites`}
      description={t`This step is for inviting teammates once the team lead is ready.`}
    />
  );
}
