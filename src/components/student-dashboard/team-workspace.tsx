'use client';

import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';

import {
  useInvitationControllerCreateInvites,
  useInvitationControllerListInvites,
  useInvitationControllerResendInvitation,
  useInvitationControllerRevokeInvitation,
  useTeamControllerFindCurrentForUser,
  useTeamControllerRemoveMember,
  useTeamControllerTransferLeadership,
  useTeamControllerUpdate,
  UserRole,
} from 'lib/api';
import { Button } from 'components/shadcn';
import { isApiNotFoundError } from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
import { StudentPageShell, StudentSectionCard, StudentStatusCard } from './page-shell';
import {
  InvitationsSection,
  LeadershipTransferSection,
  MembersSection,
  TeamLeadOnboardingGuide,
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
  const { me, isLoading } = useAuthenticatedUser([UserRole.STUDENT]);
  const [teamName, setTeamName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [newLeaderId, setNewLeaderId] = useState('');

  const teamQuery = useTeamControllerFindCurrentForUser({
    query: {
      retry: false,
      enabled: Boolean(me),
    },
  });
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

  const renameTeam = useTeamControllerUpdate();
  const createInvites = useInvitationControllerCreateInvites();
  const resendInvite = useInvitationControllerResendInvitation();
  const revokeInvite = useInvitationControllerRevokeInvitation();
  const removeMember = useTeamControllerRemoveMember();
  const transferLeadership = useTeamControllerTransferLeadership();

  const members = useMemo(() => team?.members ?? [], [team?.members]);
  const canManageTeam = mode === 'management';
  const canManageInvites = isLead;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title={t`Loading team workspace`}
          description={t`Resolving your student session.`}
        />
      </main>
    );
  }

  if (hasTeamLoadError) {
    return (
      <StudentPageShell title={title} description={description}>
        <div className="space-y-4">
          <StudentStatusCard
            title={t`Unable to load team workspace`}
            description={t`The current team could not be loaded right now. Retry the request instead of showing the empty-team state.`}
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
    return (
      <StudentPageShell title={title} description={description}>
        <>
          <StudentStatusCard
            title={t`No active team`}
            description={t`The generated \`/teams/me\` endpoint returned no active team for this user. Finish profile onboarding and create a team first.`}
          />
          <TeamLeadOnboardingGuide mode={mode} />
        </>
      </StudentPageShell>
    );
  }

  if (!me) {
    return null;
  }

  return (
    <StudentPageShell title={title} description={description}>
      <div className="space-y-6">
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
              members={members}
              removeMember={removeMember}
              team={team}
              teamQuery={teamQuery}
            />
          </>
        ) : (
          <StudentSectionCard
            title={t`Invite teammates`}
            description={t`This onboarding step is focused on filling the team once the lead account is ready.`}
          >
            <div className="space-y-3 text-sm text-neutral-700">
              <p>
                {t`Team name:`} <span className="font-semibold text-neutral-950">{team.name}</span>
              </p>
              <p>
                {t`Lead access:`}{' '}
                <span className="font-semibold text-neutral-950">{isLead ? t`Yes` : t`No`}</span>
              </p>
              <p>
                {t`Locked state:`}{' '}
                <span className="font-semibold text-neutral-950">
                  {isLocked ? t`Locked` : t`Unlocked`}
                </span>
              </p>
              <p className="text-neutral-600">
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
      description={t`This onboarding step stays focused on inviting teammates once the lead account is ready.`}
    />
  );
}
