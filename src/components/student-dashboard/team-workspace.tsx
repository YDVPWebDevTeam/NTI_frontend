'use client';

import { t } from '@lingui/core/macro';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  type AuthenticatedUserDto,
  type GetTeamInvitesResponseDto,
  type TeamDetailDto,
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
import { Button, Input, Textarea } from 'components/shadcn';
import { formatDateTime } from 'lib/date';
import { isApiNotFoundError } from 'lib/student-dashboard/normalizers';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
import { StudentPageShell, StudentSectionCard, StudentStatusCard } from './page-shell';

function parseEmails(input: string) {
  const allEmails = input
    .split(/[\n,\s]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const uniqueEmails = Array.from(new Set(allEmails));
  const validEmails = uniqueEmails.filter((entry) => /\S+@\S+\.\S+/.test(entry));
  const invalidEmails = uniqueEmails.filter((entry) => !/\S+@\S+\.\S+/.test(entry));

  return {
    validEmails,
    invalidEmails,
  };
}

type TeamWorkspaceProps = {
  title: string;
  description: string;
};

type TeamWorkspaceMode = 'management' | 'invite-onboarding';

type TeamWorkspaceResolvedProps = {
  inviteEmails: string;
  invitationsQuery: ReturnType<
    typeof useInvitationControllerListInvites<GetTeamInvitesResponseDto>
  >;
  isLead: boolean;
  isLocked: boolean;
  me: AuthenticatedUserDto;
  members: TeamDetailDto['members'];
  newLeaderId: string;
  team: TeamDetailDto;
  teamName: string;
  createInvites: ReturnType<typeof useInvitationControllerCreateInvites>;
  removeMember: ReturnType<typeof useTeamControllerRemoveMember>;
  renameTeam: ReturnType<typeof useTeamControllerUpdate>;
  resendInvite: ReturnType<typeof useInvitationControllerResendInvitation>;
  revokeInvite: ReturnType<typeof useInvitationControllerRevokeInvitation>;
  teamQuery: ReturnType<typeof useTeamControllerFindCurrentForUser<TeamDetailDto>>;
  transferLeadership: ReturnType<typeof useTeamControllerTransferLeadership>;
  setInviteEmails: Dispatch<SetStateAction<string>>;
  setNewLeaderId: Dispatch<SetStateAction<string>>;
  setTeamName: Dispatch<SetStateAction<string>>;
};

function TeamLeadOnboardingGuide({ mode }: { mode: TeamWorkspaceMode }) {
  const description =
    mode === 'invite-onboarding'
      ? 'Before you can invite teammates, create the team through `POST /teams` with the team name and teammate emails.'
      : 'If you are onboarding as the team lead, create the team through `POST /teams` with the team name and teammate emails.';

  return (
    <StudentSectionCard title="Create your team" description={description}>
      <div className="space-y-4 text-sm text-neutral-700">
        <div className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
          <p className="font-semibold text-neutral-950">Create team</p>
          <p className="mt-1 text-neutral-600">
            <code>POST /teams</code>
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-[#101a2e] p-4 text-xs leading-6 text-white">
            <code>{`{
  "name": "Alpha Team",
  "emails": ["a@nti.sk", "b@nti.sk"]
}`}</code>
          </pre>
        </div>
      </div>
    </StudentSectionCard>
  );
}

function TeamOverviewSection({
  isLead,
  isLocked,
  renameTeam,
  setTeamName,
  team,
  teamName,
  teamQuery,
}: Pick<
  TeamWorkspaceResolvedProps,
  'isLead' | 'isLocked' | 'renameTeam' | 'setTeamName' | 'team' | 'teamName' | 'teamQuery'
>) {
  return (
    <StudentSectionCard
      title="Team overview"
      description="Non-leads stay read-only. Lead privileges are derived from the current team leader id."
    >
      <div className="space-y-3 text-sm text-neutral-700">
        <p>
          Team name: <span className="font-semibold text-neutral-950">{team.name}</span>
        </p>
        <p>
          Lead access:{' '}
          <span className="font-semibold text-neutral-950">{isLead ? 'Yes' : 'No'}</span>
        </p>
        <p>
          Locked state:{' '}
          <span className="font-semibold text-neutral-950">{isLocked ? 'Locked' : 'Unlocked'}</span>
        </p>
      </div>

      {isLead ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Input
            value={teamName}
            placeholder={team.name}
            onChange={(event) => setTeamName(event.target.value)}
          />
          <Button
            disabled={!teamName.trim() || isLocked || renameTeam.isPending}
            onClick={async () => {
              try {
                await renameTeam.mutateAsync({
                  id: team.id,
                  data: { name: teamName.trim() },
                });
                setTeamName('');
                await teamQuery.refetch();
                toast.success('Team name updated.');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Unable to rename the team.');
              }
            }}
          >
            Rename team
          </Button>
        </div>
      ) : null}
    </StudentSectionCard>
  );
}

function LeadershipTransferSection({
  isLead,
  isLocked,
  me,
  members,
  newLeaderId,
  setNewLeaderId,
  team,
  teamQuery,
  transferLeadership,
}: Pick<
  TeamWorkspaceResolvedProps,
  | 'isLead'
  | 'isLocked'
  | 'me'
  | 'members'
  | 'newLeaderId'
  | 'setNewLeaderId'
  | 'team'
  | 'teamQuery'
  | 'transferLeadership'
>) {
  return (
    <StudentSectionCard
      title="Leadership transfer"
      description="Leadership transfer is disabled when the team is locked."
    >
      {isLead ? (
        <div className="space-y-3">
          <select
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
            value={newLeaderId}
            onChange={(event) => setNewLeaderId(event.target.value)}
          >
            <option value="">Select a member</option>
            {members
              .filter((member) => member.userId !== me.id)
              .map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.firstName} {member.user.lastName}
                </option>
              ))}
          </select>
          <Button
            disabled={!newLeaderId || isLocked || transferLeadership.isPending}
            onClick={async () => {
              try {
                await transferLeadership.mutateAsync({
                  teamId: team.id,
                  data: { newLeaderId },
                });
                setNewLeaderId('');
                await teamQuery.refetch();
                toast.success('Leadership transferred.');
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Unable to transfer leadership right now.',
                );
              }
            }}
          >
            Transfer leadership
          </Button>
        </div>
      ) : (
        <p className="text-sm text-neutral-600">
          Only the current team lead can transfer leadership.
        </p>
      )}
    </StudentSectionCard>
  );
}

function MembersSection({
  invitationsQuery,
  isLead,
  isLocked,
  members,
  removeMember,
  team,
  teamQuery,
}: Pick<
  TeamWorkspaceResolvedProps,
  'invitationsQuery' | 'isLead' | 'isLocked' | 'members' | 'removeMember' | 'team' | 'teamQuery'
>) {
  return (
    <StudentSectionCard
      title="Members"
      description="Member removal stays unavailable to non-leads and when the team is locked."
    >
      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentLeader = member.userId === team.leaderId;

          return (
            <div
              key={member.userId}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-neutral-950">
                  {member.user.firstName} {member.user.lastName}
                </p>
                <p className="text-sm text-neutral-600">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {isCurrentLeader ? (
                  <span className="rounded-full bg-[#dce8ff] px-3 py-1 text-xs font-semibold text-[#0c3fa3]">
                    Leader
                  </span>
                ) : null}
                {isLead && !isCurrentLeader ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLocked || removeMember.isPending}
                    onClick={async () => {
                      try {
                        await removeMember.mutateAsync({
                          teamId: team.id,
                          memberId: member.userId,
                        });
                        await Promise.all([teamQuery.refetch(), invitationsQuery.refetch()]);
                        toast.success('Member removed.');
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Unable to remove the member right now.',
                        );
                      }
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </StudentSectionCard>
  );
}

function InvitationsSection({
  createInvites,
  inviteEmails,
  invitationsQuery,
  isLocked,
  resendInvite,
  revokeInvite,
  setInviteEmails,
  team,
}: Pick<
  TeamWorkspaceResolvedProps,
  | 'createInvites'
  | 'inviteEmails'
  | 'invitationsQuery'
  | 'isLocked'
  | 'resendInvite'
  | 'revokeInvite'
  | 'setInviteEmails'
  | 'team'
>) {
  return (
    <StudentSectionCard
      title="Invitations"
      description="Lead-only invitation management is backed directly by the generated team invitation hooks."
    >
      <div className="space-y-4">
        <Textarea
          value={inviteEmails}
          onChange={(event) => setInviteEmails(event.target.value)}
          placeholder="name@example.com, teammate@example.com"
          rows={5}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isLocked || createInvites.isPending}
            onClick={async () => {
              const parsed = parseEmails(inviteEmails);

              if (!parsed.validEmails.length) {
                toast.error('Add at least one valid email address.');

                return;
              }

              if (parsed.invalidEmails.length) {
                toast.error(`Invalid emails: ${parsed.invalidEmails.join(', ')}`);

                return;
              }

              try {
                await createInvites.mutateAsync({
                  teamId: team.id,
                  data: { emails: parsed.validEmails },
                });
                setInviteEmails('');
                await invitationsQuery.refetch();
                toast.success('Invitations created.');
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Unable to create invitations right now.',
                );
              }
            }}
          >
            Send invites
          </Button>
        </div>

        <div className="space-y-3">
          {(invitationsQuery.data?.data ?? []).map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-neutral-950">{invitation.email}</p>
                <p className="text-sm text-neutral-600">
                  {invitation.status} · created {formatDateTime(invitation.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLocked || invitation.status !== 'PENDING' || resendInvite.isPending}
                  onClick={async () => {
                    try {
                      await resendInvite.mutateAsync({
                        teamId: team.id,
                        invitationId: invitation.id,
                      });
                      await invitationsQuery.refetch();
                      toast.success('Invitation resent.');
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : 'Unable to resend the invitation.',
                      );
                    }
                  }}
                >
                  Resend
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLocked || invitation.status !== 'PENDING' || revokeInvite.isPending}
                  onClick={async () => {
                    try {
                      await revokeInvite.mutateAsync({
                        teamId: team.id,
                        invitationId: invitation.id,
                      });
                      await invitationsQuery.refetch();
                      toast.success('Invitation revoked.');
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : 'Unable to revoke the invitation.',
                      );
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentSectionCard>
  );
}

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
    {
      limit: 20,
      page: 1,
      sort: 'createdAt',
      order: 'desc',
    },
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
          title="Loading team workspace"
          description="Resolving your student session."
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
            title="No active team"
            description="The generated `/teams/me` endpoint returned no active team for this user. Finish profile onboarding and create a team first."
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
            title="Invite teammates"
            description="This onboarding step is focused on filling the team once the lead account is ready."
          >
            <div className="space-y-3 text-sm text-neutral-700">
              <p>
                Team name: <span className="font-semibold text-neutral-950">{team.name}</span>
              </p>
              <p>
                Lead access:{' '}
                <span className="font-semibold text-neutral-950">{isLead ? 'Yes' : 'No'}</span>
              </p>
              <p>
                Locked state:{' '}
                <span className="font-semibold text-neutral-950">
                  {isLocked ? 'Locked' : 'Unlocked'}
                </span>
              </p>
              <p className="text-neutral-600">
                {isLead
                  ? 'Invite teammates from here, then return to the dashboard once the roster looks right.'
                  : 'Only the current team lead can send invitations. Ask the lead to add the remaining teammates.'}
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
      title="Team"
      description="Non-leads stay read-only, while team leads can rename the team, manage invitations, remove members, and transfer leadership."
    />
  );
}

export function TeamInviteOnboardingWorkspace() {
  return (
    <TeamWorkspaceView
      mode="invite-onboarding"
      title="Team invites"
      description="This onboarding step stays focused on inviting teammates once the lead account is ready."
    />
  );
}
