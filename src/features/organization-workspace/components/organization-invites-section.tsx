'use client';

import { t } from '@lingui/core/macro';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, RotateCcw, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  getOrganizationControllerListInvitesQueryKey,
  useOrganizationControllerCreateInvite,
  useOrganizationControllerListInvites,
  useOrganizationControllerResendInvite,
  useOrganizationControllerRevokeInvite,
} from 'lib/api';
import { isApiRequestError } from 'lib/api-client/openapi-runtime/client';
import { ControlledInputField } from 'components/forms';
import { Form, Button, Badge } from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';
import {
  OrganizationEmptyState,
  OrganizationErrorState,
  OrganizationLoadingState,
  OrganizationSectionCard,
} from './organization-workspace-primitives';
import { createOrganizationInviteSchema, type OrganizationInviteFormValues } from '../lib/schemas';

const INVITE_PAGE_SIZE = 10;
const FORBIDDEN_STATUS = 403;

function getInvitesLoadErrorMessage(error: unknown) {
  if (isApiRequestError(error) && error.status === FORBIDDEN_STATUS) {
    return t`Invites are only available after your account and organization are active.`;
  }

  return t`We couldn’t load invitations right now.`;
}

export function OrganizationInvitesSection({ organizationId }: { organizationId: string }) {
  const queryClient = useQueryClient();
  const [activeInviteActionId, setActiveInviteActionId] = useState<string | null>(null);

  const invitesQuery = useOrganizationControllerListInvites(
    organizationId,
    { page: 1, limit: INVITE_PAGE_SIZE },
    {
      query: {
        enabled: Boolean(organizationId),
      },
    },
  );
  const createInvite = useOrganizationControllerCreateInvite();
  const resendInvite = useOrganizationControllerResendInvite();
  const revokeInvite = useOrganizationControllerRevokeInvite();

  const form = useForm<OrganizationInviteFormValues>({
    resolver: zodResolver(createOrganizationInviteSchema()),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const refreshInvites = async () => {
    await queryClient.invalidateQueries({
      queryKey: getOrganizationControllerListInvitesQueryKey(organizationId, {
        page: 1,
        limit: INVITE_PAGE_SIZE,
      }),
    });
  };

  const handleCreateInvite = async (values: OrganizationInviteFormValues) => {
    try {
      await createInvite.mutateAsync({
        id: organizationId,
        data: {
          email: values.email.trim().toLowerCase(),
          roleToAssign: 'COMPANY_EMPLOYEE',
        },
      });

      toast.success(t`Employee invitation sent.`);
      form.reset();
      await refreshInvites();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to send invitation.`);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    setActiveInviteActionId(inviteId);

    try {
      await resendInvite.mutateAsync({
        id: organizationId,
        inviteId,
      });

      toast.success(t`Invitation resent.`);
      await refreshInvites();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to resend invitation.`);
    } finally {
      setActiveInviteActionId(null);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setActiveInviteActionId(inviteId);

    try {
      await revokeInvite.mutateAsync({
        id: organizationId,
        inviteId,
      });

      toast.success(t`Invitation revoked.`);
      await refreshInvites();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to revoke invitation.`);
    } finally {
      setActiveInviteActionId(null);
    }
  };

  return (
    <OrganizationSectionCard
      title={t`Access invites`}
      description={t`Invite teammates, keep track of pending invites, and manage access in one place.`}
      badge={t`Owner only`}
    >
      <div className="space-y-6">
        <Form {...form}>
          <form
            className="border-border bg-muted rounded-2xl border p-5"
            onSubmit={form.handleSubmit(handleCreateInvite)}
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <ControlledInputField
                control={form.control}
                name="email"
                label={t`Employee email`}
                type="email"
                placeholder="teammate@example.com"
                autoComplete="email"
                startIcon={<Mail className="h-4 w-4" />}
                description={t`Invited teammates join as company employees.`}
              />

              <Button
                type="submit"
                className="md:h-12"
                disabled={createInvite.isPending || !form.formState.isValid}
              >
                <Send className="mr-2 h-4 w-4" />
                {createInvite.isPending ? t`Sending invite…` : t`Send invite`}
              </Button>
            </div>
          </form>
        </Form>

        {invitesQuery.isLoading ? (
          <OrganizationLoadingState label={t`Loading invitations…`} />
        ) : null}

        {invitesQuery.isError ? (
          <OrganizationErrorState
            title={t`Unable to load invitations`}
            description={getInvitesLoadErrorMessage(invitesQuery.error)}
            onRetry={() => void invitesQuery.refetch()}
          />
        ) : null}

        {!invitesQuery.isLoading &&
        !invitesQuery.isError &&
        (invitesQuery.data?.data?.length ?? 0) === 0 ? (
          <OrganizationEmptyState
            title={t`No invitations yet`}
            description={t`Send your first invite to give a teammate access.`}
          />
        ) : null}

        {!invitesQuery.isLoading && !invitesQuery.isError ? (
          <div className="space-y-3">
            {(invitesQuery.data?.data ?? []).map((invite) => {
              const isPendingAction = activeInviteActionId === invite.id;
              const isPendingInvite = invite.status === 'PENDING';

              return (
                <div
                  key={invite.id}
                  className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground text-base font-semibold">{invite.email}</p>
                      <Badge className="bg-accent text-primary hover:bg-accent">
                        {formatEnumLabel(invite.status)}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span>
                        {t`Created`}: {new Date(invite.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        {t`Expires`}: {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                      <span>
                        {t`Role`}: {t`Company employee`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isPendingInvite || isPendingAction}
                      onClick={() => void handleResendInvite(invite.id)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {isPendingAction && isPendingInvite ? t`Working…` : t`Resend`}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isPendingInvite || isPendingAction}
                      onClick={() => void handleRevokeInvite(invite.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isPendingAction && isPendingInvite ? t`Working…` : t`Revoke`}
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
