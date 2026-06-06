'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Crown, ShieldCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  getGetMeQueryKey,
  getOrganizationControllerListMembersQueryKey,
  useOrganizationControllerListMembers,
  useOrganizationControllerRemoveMember,
  useOrganizationControllerTransferOwner,
  type AuthenticatedUserDto,
} from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';
import {
  OrganizationEmptyState,
  OrganizationErrorState,
  OrganizationLoadingState,
  OrganizationSectionCard,
  formatOrganizationRoleLabel,
} from './organization-workspace-primitives';

export function OrganizationMembersSection({
  organizationId,
  currentUser,
}: {
  organizationId: string;
  currentUser: AuthenticatedUserDto;
}) {
  const queryClient = useQueryClient();
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [transferTargetId, setTransferTargetId] = useState('');

  const membersQuery = useOrganizationControllerListMembers(organizationId, {
    query: {
      enabled: Boolean(organizationId),
    },
  });
  const removeMember = useOrganizationControllerRemoveMember();
  const transferOwner = useOrganizationControllerTransferOwner();
  const FORBIDDEN_STATUS = 403;

  const getMembersLoadErrorMessage = (error: unknown) => {
    if (isApiRequestError(error) && error.status === FORBIDDEN_STATUS) {
      return t`Members are only available after your account and organization are active.`;
    }

    return t`We couldn’t load the member list right now.`;
  };

  const refreshMembers = async () => {
    await queryClient.invalidateQueries({
      queryKey: getOrganizationControllerListMembersQueryKey(organizationId),
    });
  };

  const members = membersQuery.data ?? [];
  const transferCandidates = useMemo(
    () => members.filter((member) => member.role !== 'COMPANY_OWNER' && member.status === 'ACTIVE'),
    [members],
  );

  const handleRemoveMember = async (userId: string, label: string) => {
    const confirmed = window.confirm(
      t`Remove ${label} from the organization? They will lose organization access immediately.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveMemberId(userId);

    try {
      await removeMember.mutateAsync({
        id: organizationId,
        userId,
      });

      toast.success(t`Member removed.`);
      await refreshMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to remove member.`);
    } finally {
      setActiveMemberId(null);
    }
  };

  const handleTransferOwner = async () => {
    if (!transferTargetId) {
      return;
    }

    const selectedMember = transferCandidates.find((member) => member.id === transferTargetId);

    if (!selectedMember) {
      return;
    }

    const confirmed = window.confirm(
      t`Transfer ownership to ${selectedMember.firstName} ${selectedMember.lastName}? Your account will become a company employee.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveMemberId(transferTargetId);

    try {
      await transferOwner.mutateAsync({
        id: organizationId,
        data: {
          newOwnerUserId: transferTargetId,
        },
      });

      toast.success(t`Organization ownership transferred.`);
      setTransferTargetId('');
      await queryClient.invalidateQueries({
        queryKey: getGetMeQueryKey(),
      });
      await refreshMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to transfer ownership.`);
    } finally {
      setActiveMemberId(null);
    }
  };

  return (
    <OrganizationSectionCard
      title={t`Members`}
      description={t`See who has access, update member roles, and transfer ownership when needed.`}
      badge={t`Owner only`}
    >
      <div className="space-y-6">
        <div className="rounded-[1.5rem] border border-[#dce5fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#10213d]">{t`Transfer ownership`}</p>
              <p className="text-sm leading-6 text-[#60718d]">
                {t`Choose another active member to take over as company owner. Your access will switch to company employee.`}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_auto]">
              <Select value={transferTargetId} onValueChange={setTransferTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select new owner`} />
                </SelectTrigger>
                <SelectContent>
                  {transferCandidates.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} · {member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                disabled={!transferTargetId || transferOwner.isPending}
                onClick={() => void handleTransferOwner()}
              >
                <Crown className="mr-2 h-4 w-4" />
                {transferOwner.isPending ? t`Transferring…` : t`Transfer owner`}
              </Button>
            </div>
          </div>
        </div>

        {membersQuery.isLoading ? <OrganizationLoadingState label={t`Loading members…`} /> : null}

        {membersQuery.isError ? (
          <OrganizationErrorState
            title={t`Unable to load members`}
            description={getMembersLoadErrorMessage(membersQuery.error)}
            onRetry={() => void membersQuery.refetch()}
          />
        ) : null}

        {!membersQuery.isLoading && !membersQuery.isError && members.length === 0 ? (
          <OrganizationEmptyState
            title={t`No members found`}
            description={t`Organization members will appear here as invitations are accepted.`}
          />
        ) : null}

        {!membersQuery.isLoading && !membersQuery.isError ? (
          <div className="space-y-3">
            {members.map((member) => {
              const isOwner = member.role === 'COMPANY_OWNER';
              const isCurrentUser = member.id === currentUser.id;
              const isPendingAction = activeMemberId === member.id;

              return (
                <div
                  key={member.id}
                  className="grid gap-4 rounded-[1.5rem] border border-[#dfe7fa] bg-white p-5 shadow-[0_8px_20px_rgba(19,27,46,0.04)] lg:grid-cols-[minmax(0,1fr)_220px_auto]"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-[#10213d]">
                        {member.firstName} {member.lastName}
                      </p>
                      {isOwner ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4dd] px-3 py-1 text-xs font-semibold text-[#9a6500]">
                          <Crown className="h-3.5 w-3.5" />
                          {t`Owner`}
                        </span>
                      ) : null}
                      {isCurrentUser ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#1f56c2]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {t`You`}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#60718d]">
                      <span>{member.email}</span>
                      <span>
                        {t`Status`}: {formatEnumLabel(member.status)}
                      </span>
                      <span>
                        {t`Joined`}: {new Date(member.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6c7c99] uppercase">
                      {t`Role`}
                    </p>
                    <div className="rounded-xl border border-[#e2e8f7] bg-[#f8fbff] px-3 py-2 text-sm font-medium text-[#10213d]">
                      {formatOrganizationRoleLabel(member.role)}
                    </div>
                  </div>

                  <div className="flex items-start justify-start lg:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isOwner || isCurrentUser || isPendingAction}
                      onClick={() =>
                        void handleRemoveMember(member.id, `${member.firstName} ${member.lastName}`)
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isPendingAction ? t`Working…` : t`Remove member`}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </OrganizationSectionCard>
  );
}
