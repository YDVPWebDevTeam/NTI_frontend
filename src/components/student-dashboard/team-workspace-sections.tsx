'use client';

import { t } from '@lingui/core/macro';
import { toast } from 'sonner';

import type { AuthenticatedUserDto, TeamDetailDto, TeamInviteItemDto } from 'lib/api';
import { Button, Input, Textarea } from 'components/shadcn';
import { formatDateTime } from 'lib/date';
import { StudentSectionCard } from './page-shell-primitives';

export type TeamWorkspaceMode = 'management' | 'invite-onboarding';

const MIN_TEAMMATES_FOR_TEAM_CREATION = 2;

type MutationLike<TPayload> = {
  isPending: boolean;
  mutateAsync: (payload: TPayload) => Promise<unknown>;
};

type QueryLike<TData> = {
  data?: TData;
  refetch: () => Promise<unknown>;
};

export function parseEmails(input: string) {
  const allEmails = input
    .split(/[\n,\s]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const uniqueEmails = Array.from(new Set(allEmails));
  const validEmails = uniqueEmails.filter((entry) => /\S+@\S+\.\S+/.test(entry));
  const invalidEmails = uniqueEmails.filter((entry) => !/\S+@\S+\.\S+/.test(entry));

  return { validEmails, invalidEmails };
}

export function TeamLeadOnboardingGuide({ mode }: { mode: TeamWorkspaceMode }) {
  const description =
    mode === 'invite-onboarding'
      ? t`Create the team first, then the invited students can join through their email links.`
      : t`If you are onboarding as the team lead, create the team here and send the first teammate invites immediately.`;

  return (
    <StudentSectionCard title={t`Create your team`} description={description}>
      <div className="space-y-4 text-sm text-neutral-700">
        <p>{t`Team creation requires a team name and at least two teammate email addresses.`}</p>
      </div>
    </StudentSectionCard>
  );
}

export function TeamCreationSection({
  createTeam,
  currentUserEmail,
  inviteEmails,
  setInviteEmails,
  setTeamName,
  teamName,
  teamQuery,
}: {
  createTeam: MutationLike<{ data: { name: string; emails: string[] } }>;
  currentUserEmail?: string;
  inviteEmails: string;
  setInviteEmails: (value: string) => void;
  setTeamName: (value: string) => void;
  teamName: string;
  teamQuery: QueryLike<unknown>;
}) {
  const normalizedCurrentUserEmail = currentUserEmail?.trim().toLowerCase() ?? '';
  const description = t`Create the team first, then start inviting the rest of the student members.`;

  return (
    <StudentSectionCard title={t`Create your team`} description={description}>
      <div className="space-y-4">
        <Input
          value={teamName}
          onChange={(event) => setTeamName(event.target.value)}
          placeholder={t`Alpha Team`}
        />
        <Textarea
          value={inviteEmails}
          onChange={(event) => setInviteEmails(event.target.value)}
          placeholder={t`name@example.com, teammate@example.com`}
          rows={5}
        />
        <p className="text-sm text-neutral-600">
          {t`Add at least two teammate emails. Your own account will be added automatically as the team lead.`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={createTeam.isPending || !teamName.trim()}
            onClick={async () => {
              const parsed = parseEmails(inviteEmails);
              const teammateEmails = parsed.validEmails.filter(
                (email) => email !== normalizedCurrentUserEmail,
              );

              if (!teamName.trim()) {
                toast.error(t`Team name is required.`);

                return;
              }

              if (parsed.invalidEmails.length > 0) {
                toast.error(t`Invalid emails: ${parsed.invalidEmails.join(', ')}`);

                return;
              }

              if (teammateEmails.length < MIN_TEAMMATES_FOR_TEAM_CREATION) {
                toast.error(t`Add at least two valid teammate email addresses.`);

                return;
              }

              try {
                await createTeam.mutateAsync({
                  data: {
                    name: teamName.trim(),
                    emails: teammateEmails,
                  },
                });
                setTeamName('');
                setInviteEmails('');
                await teamQuery.refetch();
                toast.success(t`Team created.`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : t`Unable to create team.`);
              }
            }}
          >
            {createTeam.isPending ? t`Creating...` : t`Create team`}
          </Button>
        </div>
      </div>
    </StudentSectionCard>
  );
}

export function TeamOverviewSection({
  isLead,
  isLocked,
  renameTeam,
  setTeamName,
  team,
  teamName,
  teamQuery,
}: {
  isLead: boolean;
  isLocked: boolean;
  renameTeam: MutationLike<{ id: string; data: { name: string } }>;
  setTeamName: (value: string) => void;
  team: TeamDetailDto;
  teamName: string;
  teamQuery: QueryLike<unknown>;
}) {
  return (
    <StudentSectionCard
      title={t`Team overview`}
      description={t`Non-leads stay read-only. Lead privileges are derived from the current team leader id.`}
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
                await renameTeam.mutateAsync({ id: team.id, data: { name: teamName.trim() } });
                setTeamName('');
                await teamQuery.refetch();
                toast.success(t`Team name updated.`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : t`Unable to rename the team.`);
              }
            }}
          >
            {t`Rename team`}
          </Button>
        </div>
      ) : null}
    </StudentSectionCard>
  );
}

export function LeadershipTransferSection({
  isLead,
  isLocked,
  me,
  members,
  newLeaderId,
  setNewLeaderId,
  team,
  teamQuery,
  transferLeadership,
}: {
  isLead: boolean;
  isLocked: boolean;
  me: AuthenticatedUserDto;
  members: TeamDetailDto['members'];
  newLeaderId: string;
  setNewLeaderId: (value: string) => void;
  team: TeamDetailDto;
  teamQuery: QueryLike<unknown>;
  transferLeadership: MutationLike<{ teamId: string; data: { newLeaderId: string } }>;
}) {
  return (
    <StudentSectionCard
      title={t`Leadership transfer`}
      description={t`Leadership transfer is disabled when the team is locked.`}
    >
      {isLead ? (
        <div className="space-y-3">
          <select
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
            value={newLeaderId}
            onChange={(event) => setNewLeaderId(event.target.value)}
          >
            <option value="">{t`Select a member`}</option>
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
                toast.success(t`Leadership transferred.`);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : t`Unable to transfer leadership right now.`,
                );
              }
            }}
          >
            {t`Transfer leadership`}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-neutral-600">
          {t`Only the current team lead can transfer leadership.`}
        </p>
      )}
    </StudentSectionCard>
  );
}

export function MembersSection({
  invitationsQuery,
  isLead,
  isLocked,
  members,
  removeMember,
  team,
  teamQuery,
}: {
  invitationsQuery: QueryLike<{ data: TeamInviteItemDto[] }>;
  isLead: boolean;
  isLocked: boolean;
  members: TeamDetailDto['members'];
  removeMember: MutationLike<{ teamId: string; memberId: string }>;
  team: TeamDetailDto;
  teamQuery: QueryLike<unknown>;
}) {
  return (
    <StudentSectionCard
      title={t`Members`}
      description={t`Member removal stays unavailable to non-leads and when the team is locked.`}
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
                    {t`Leader`}
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
                        toast.success(t`Member removed.`);
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : t`Unable to remove the member right now.`,
                        );
                      }
                    }}
                  >
                    {t`Remove`}
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

export function InvitationsSection({
  createInvites,
  inviteEmails,
  invitationsQuery,
  isLocked,
  resendInvite,
  revokeInvite,
  setInviteEmails,
  team,
}: {
  createInvites: MutationLike<{ teamId: string; data: { emails: string[] } }>;
  inviteEmails: string;
  invitationsQuery: QueryLike<{ data: TeamInviteItemDto[] }>;
  isLocked: boolean;
  resendInvite: MutationLike<{ teamId: string; invitationId: string }>;
  revokeInvite: MutationLike<{ teamId: string; invitationId: string }>;
  setInviteEmails: (value: string) => void;
  team: TeamDetailDto;
}) {
  return (
    <StudentSectionCard
      title={t`Invitations`}
      description={t`Only team leads can manage invitations.`}
    >
      <div className="space-y-4">
        <Textarea
          value={inviteEmails}
          onChange={(event) => setInviteEmails(event.target.value)}
          placeholder={t`name@example.com, teammate@example.com`}
          rows={5}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isLocked || createInvites.isPending}
            onClick={async () => {
              const parsed = parseEmails(inviteEmails);

              if (!parsed.validEmails.length) {
                toast.error(t`Add at least one valid email address.`);

                return;
              }

              if (parsed.invalidEmails.length) {
                toast.error(t`Invalid emails: ${parsed.invalidEmails.join(', ')}`);

                return;
              }

              try {
                await createInvites.mutateAsync({
                  teamId: team.id,
                  data: { emails: parsed.validEmails },
                });
                setInviteEmails('');
                await invitationsQuery.refetch();
                toast.success(t`Invitations created.`);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : t`Unable to create invitations right now.`,
                );
              }
            }}
          >
            {t`Send invites`}
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
                  {invitation.status} · {t`created`} {formatDateTime(invitation.createdAt)}
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
                      toast.success(t`Invitation resent.`);
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : t`Unable to resend the invitation.`,
                      );
                    }
                  }}
                >
                  {t`Resend`}
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
                      toast.success(t`Invitation revoked.`);
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : t`Unable to revoke the invitation.`,
                      );
                    }
                  }}
                >
                  {t`Revoke`}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentSectionCard>
  );
}
