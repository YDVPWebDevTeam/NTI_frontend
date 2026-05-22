'use client';

import { t } from '@lingui/core/macro';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Building2, Loader2, Mail, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useOrganizationControllerCreateInvite,
  useOrganizationControllerGetMyOrganization,
  useOrganizationControllerListInvites,
  useOrganizationControllerResendInvite,
  useOrganizationControllerRevokeInvite,
} from 'lib/api';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from 'components/shadcn';

export default function OrganizationInviteDashboard() {
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [activeResendInviteId, setActiveResendInviteId] = useState<string | null>(null);
  const [activeRevokeInviteId, setActiveRevokeInviteId] = useState<string | null>(null);

  const organizationQuery = useOrganizationControllerGetMyOrganization();
  const createInvite = useOrganizationControllerCreateInvite();
  const resendInvite = useOrganizationControllerResendInvite();
  const revokeInvite = useOrganizationControllerRevokeInvite();

  const organization = organizationQuery.data;
  const organizationId = organization?.id ?? '';

  const invitesQuery = useOrganizationControllerListInvites(
    organizationId,
    {
      page: 1,
      limit: 10,
    },
    {
      query: {
        enabled: Boolean(organizationId),
      },
    },
  );

  const normalizedEmail = email.trim().toLowerCase();
  const invites = invitesQuery.data?.data ?? [];

  const isSubmitDisabled =
    !organizationId || !normalizedEmail || createInvite.isPending || organizationQuery.isLoading;

  const refreshInvites = async () => {
    await queryClient.invalidateQueries({
      queryKey: [`/organizations/${organizationId}/invites`],
    });
  };

  const handleCreateInvite = async () => {
    if (!organizationId || !normalizedEmail) {
      return;
    }

    try {
      await createInvite.mutateAsync({
        id: organizationId,
        data: {
          email: normalizedEmail,
          roleToAssign: 'COMPANY_EMPLOYEE',
        },
      });

      setEmail('');
      toast.success(t`Employee invitation sent.`);

      await refreshInvites();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to send invitation.`);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    if (!organizationId) {
      return;
    }

    setActiveResendInviteId(inviteId);

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
      setActiveResendInviteId(null);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!organizationId) {
      return;
    }

    setActiveRevokeInviteId(inviteId);

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
      setActiveRevokeInviteId(null);
    }
  };

  return (
    <main className="bg-surface text-on-surface min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="space-y-3">
          <p className="text-tertiary text-xs font-bold tracking-widest uppercase">
            {t`Organization dashboard`}
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-headline text-on-surface text-4xl font-bold tracking-tight">
                {t`Manage organization access`}
              </h1>

              <p className="text-on-surface-variant mt-3 max-w-2xl text-[15px] leading-relaxed">
                {t`Invite employees to join your organization, track pending invitations, and manage organization members from one place.`}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <Card className="bg-surface-container-lowest rounded-2xl border border-black/10 shadow-sm">
              <CardHeader className="space-y-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>

                <div>
                  <CardTitle className="font-headline text-2xl text-[#0c1a4f]">
                    {t`Current organization`}
                  </CardTitle>

                  <p className="text-on-surface-variant mt-2 text-sm leading-6">
                    {t`Organization details are loaded from the authenticated company owner account.`}
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="bg-surface-container-low rounded-2xl border border-black/10 p-4">
                  <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase">
                    {t`Organization`}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-[#0c1a4f]">
                    {organizationQuery.isLoading
                      ? t`Loading organization…`
                      : (organization?.name ?? t`No organization found`)}
                  </h2>

                  <p className="text-on-surface-variant mt-1 text-sm">
                    {organization
                      ? t`ICO: ${organization.ico}`
                      : t`Members and invitations will appear here after API integration.`}
                  </p>

                  {organization?.status ? (
                    <Badge className="mt-3 bg-[#dce8ff] text-[#0c3fa3] hover:bg-[#dce8ff]">
                      {organization.status}
                    </Badge>
                  ) : null}

                  {organizationQuery.isError ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {t`Unable to load your organization.`}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-container-lowest rounded-2xl border border-black/10 shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-[#0c1a4f]">
                  {t`Invite employee`}
                </CardTitle>

                <p className="text-on-surface-variant mt-2 text-sm leading-6">
                  {t`Send an invitation to a colleague. The invited user will join as a company employee.`}
                </p>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="employee-email"
                    className="text-[11px] font-medium tracking-[0.12em] text-neutral-500 uppercase"
                  >
                    {t`Employee email`}
                  </label>

                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="employee-email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder="employee@example.com"
                      className="h-12 rounded-sm border-black/10 bg-white pl-10"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#1e58d5]/15 bg-[#f4f8ff] px-4 py-3 text-sm text-[#23407b]">
                  {t`Role selection is intentionally hidden. Every organization invitation assigns the company employee role.`}
                </div>

                <Button
                  type="button"
                  disabled={isSubmitDisabled}
                  onClick={() => void handleCreateInvite()}
                  className="h-12 w-full rounded-sm bg-[#1e58d5] text-[12px] font-semibold tracking-widest text-white hover:bg-[#245fdc]"
                >
                  {createInvite.isPending ? t`SENDING INVITATION...` : t`SEND INVITATION`}
                  {createInvite.isPending ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-surface-container-lowest rounded-2xl border border-black/10 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl text-[#0c1a4f]">
                    {t`Current invitations`}
                  </CardTitle>

                  <p className="text-on-surface-variant mt-2 text-sm leading-6">
                    {t`Track pending, accepted, expired, and revoked employee invitations.`}
                  </p>
                </div>

                <Badge className="w-fit bg-[#dce8ff] text-[#0c3fa3] hover:bg-[#dce8ff]">
                  <Users className="mr-2 h-4 w-4" />
                  {t`Employees`}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {invitesQuery.isLoading ? (
                <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 text-sm text-neutral-600">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1e58d5]" />
                  {t`Loading invitations…`}
                </div>
              ) : null}

              {invitesQuery.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {t`Unable to load organization invitations.`}
                </div>
              ) : null}

              {!invitesQuery.isLoading && !invitesQuery.isError && invites.length === 0 ? (
                <div className="bg-surface-container-low text-on-surface-variant rounded-xl border border-dashed border-black/15 p-6 text-sm">
                  {t`No employee invitations yet. Send the first invitation using the form on the left.`}
                </div>
              ) : null}

              {invites.map((invite) => {
                const isResendingInvite = activeResendInviteId === invite.id;
                const isRevokingInvite = activeRevokeInviteId === invite.id;
                const isPendingInvite = invite.status === 'PENDING';

                return (
                  <div
                    key={invite.id}
                    className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold text-[#0c1a4f]">{invite.email}</p>

                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {invite.status}
                          </Badge>
                        </div>

                        <div className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
                          <p>
                            <span className="font-medium text-neutral-900">{t`Created:`}</span>{' '}
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </p>

                          <p>
                            <span className="font-medium text-neutral-900">{t`Expires:`}</span>{' '}
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!isPendingInvite || isResendingInvite}
                          onClick={() => void handleResendInvite(invite.id)}
                        >
                          {isResendingInvite ? t`Resending...` : t`Resend`}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={!isPendingInvite || isRevokingInvite}
                          onClick={() => void handleRevokeInvite(invite.id)}
                        >
                          {isRevokingInvite ? t`Revoking...` : t`Revoke`}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
