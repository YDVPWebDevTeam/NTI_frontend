'use client';

import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useCreateTeamInvitationsMutation,
  useMyTeamQuery,
  useRevokeTeamInvitationMutation,
  useResendTeamInvitationMutation,
  useTeamInvitationsQuery,
  type TeamInvitation,
  type TeamInvitationStatus,
} from 'lib/api';

import { ApiRequestError } from 'lib/api/base-client';
import { ROUTES } from 'lib/constants';
import { formatDateTime } from 'lib/date';
import { useResendCooldown } from 'lib/hooks/use-resend-cooldown';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from 'components/shadcn';

const STATUS_OPTIONS: Array<{ value: 'ALL' | TeamInvitationStatus; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'REVOKED', label: 'Revoked' },
];
const MULTIPLE_ACTIVE_TEAMS_STATUS = 409;
const INVITE_RESEND_COOLDOWN_SECONDS = 90;
const emailSchema = z.email();

function normalizeStatus(value: string | null): 'ALL' | TeamInvitationStatus {
  const matchedStatus = STATUS_OPTIONS.find((option) => option.value === value);

  return matchedStatus?.value ?? 'ALL';
}

function parsePage(value: string | null) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function parseEmails(value: string) {
  const allEmails = value
    .split(/[\n,\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const uniqueEmails = Array.from(new Set(allEmails));
  const validEmails = uniqueEmails.filter((email) => emailSchema.safeParse(email).success);
  const invalidEmails = uniqueEmails.filter((email) => !emailSchema.safeParse(email).success);

  return {
    allCount: allEmails.length,
    duplicateCount: allEmails.length - uniqueEmails.length,
    validEmails,
    invalidEmails,
  };
}

function getStatusBadgeVariant(status: TeamInvitationStatus) {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-100 text-emerald-800';

    case 'EXPIRED':
      return 'bg-amber-100 text-amber-800';

    case 'REVOKED':
      return 'bg-red-100 text-red-800';

    default:
      return 'bg-blue-100 text-blue-800';
  }
}

type TeamInvitationRowProps = {
  invitation: TeamInvitation;
  locale: string;
  isResending: boolean;
  isRevoking: boolean;
  onResend: (invitationId: string) => Promise<boolean>;
  onRevoke: (invitationId: string) => Promise<boolean>;
};

function TeamInvitationRow({
  invitation,
  locale,
  isResending,
  isRevoking,
  onResend,
  onRevoke,
}: TeamInvitationRowProps) {
  const { isCoolingDown, remainingSeconds, startCooldown } = useResendCooldown(
    `team-invite-resend:${invitation.id}`,
    INVITE_RESEND_COOLDOWN_SECONDS,
  );
  const canManageInvitation = invitation.status === 'PENDING';

  let resendLabel = t`Resend`;

  if (isResending) {
    resendLabel = t`Sending…`;
  } else if (isCoolingDown) {
    resendLabel = t`Resend in ${remainingSeconds}s`;
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f8fa] p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="min-w-0 text-base font-semibold break-words text-[#0c1a4f]">
              {invitation.email}
            </p>
            <Badge className={getStatusBadgeVariant(invitation.status)}>{invitation.status}</Badge>
          </div>

          <div className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
            <p>
              <span className="font-medium text-neutral-900">{t`Created`}:</span>{' '}
              {formatDateTime(invitation.createdAt, locale)}
            </p>
            <p>
              <span className="font-medium text-neutral-900">{t`Expires`}:</span>{' '}
              {formatDateTime(invitation.expiresAt, locale)}
            </p>
          </div>

          {isCoolingDown && canManageInvitation ? (
            <p className="text-sm text-neutral-500" aria-live="polite">
              {t`This invite was just resent. Wait for the countdown before sending it again.`}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isResending || isRevoking || isCoolingDown || !canManageInvitation}
            onClick={async () => {
              const wasResent = await onResend(invitation.id);

              if (wasResent) {
                startCooldown();
              }
            }}
          >
            {resendLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isResending || isRevoking || !canManageInvitation}
            onClick={async () => {
              const confirmed = window.confirm(
                t`Revoke this invitation? The recipient will no longer be able to use the current invite link.`,
              );

              if (!confirmed) {
                return;
              }

              await onRevoke(invitation.id);
            }}
          >
            {isRevoking ? t`Revoking…` : t`Revoke`}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TeamInvitesOnboardingPage() {
  const { i18n } = useLingui();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [emailsText, setEmailsText] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [status, setStatus] = useState<'ALL' | TeamInvitationStatus>(() =>
    normalizeStatus(searchParams.get('status')),
  );
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [page, setPage] = useState(() => parsePage(searchParams.get('page')));
  const [activeResendId, setActiveResendId] = useState<string | null>(null);
  const [activeRevokeId, setActiveRevokeId] = useState<string | null>(null);

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
    setStatus(normalizeStatus(searchParams.get('status')));
    setPage(parsePage(searchParams.get('page')));
  }, [searchParams]);

  const deferredSearch = useDeferredValue(search);
  const teamQuery = useMyTeamQuery(true);
  const teamId = teamQuery.data?.id ?? '';

  const invitationFilters = useMemo(
    () => ({
      page,
      limit: 10,
      q: deferredSearch || undefined,
      status: status === 'ALL' ? undefined : status,
      sort: 'createdAt' as const,
      order: 'desc' as const,
    }),
    [deferredSearch, page, status],
  );

  const parsedEmails = useMemo(() => parseEmails(emailsText), [emailsText]);
  const invitationsQuery = useTeamInvitationsQuery(teamId, invitationFilters, Boolean(teamId));
  const createInvitations = useCreateTeamInvitationsMutation();
  const resendInvitation = useResendTeamInvitationMutation();
  const revokeInvitation = useRevokeTeamInvitationMutation();

  const updateUrlState = (nextValues: {
    q?: string;
    status?: 'ALL' | TeamInvitationStatus;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSearch = nextValues.q ?? search;
    const nextStatus = nextValues.status ?? status;
    const nextPage = nextValues.page ?? page;

    if (nextSearch.trim()) {
      params.set('q', nextSearch.trim());
    } else {
      params.delete('q');
    }

    if (nextStatus === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', nextStatus);
    }

    if (nextPage > 1) {
      params.set('page', String(nextPage));
    } else {
      params.delete('page');
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const refreshInvites = async () => {
    await queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'invitations'] });
  };

  const handleCreateInvites = async () => {
    if (parsedEmails.validEmails.length === 0 || parsedEmails.invalidEmails.length > 0 || !teamId) {
      return;
    }

    setCreateError(null);

    try {
      const response = await createInvitations.mutateAsync({
        teamId,
        payload: { emails: parsedEmails.validEmails },
      });

      setEmailsText('');
      toast.success(
        response.createdCount === 1
          ? t`1 invitation created.`
          : t`${response.createdCount} invitations created.`,
      );

      await refreshInvites();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t`Unable to create invitations right now. Review the email list and try again.`;

      setCreateError(message);
      toast.error(message);
    }
  };

  const handleResend = async (invitationId: string) => {
    if (!teamId) {
      return false;
    }

    setActiveResendId(invitationId);

    try {
      await resendInvitation.mutateAsync({ teamId, invitationId });
      toast.success(t`Invitation resent.`);

      await refreshInvites();

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Unable to resend the invitation right now.`,
      );

      return false;
    } finally {
      setActiveResendId(null);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!teamId) {
      return false;
    }

    setActiveRevokeId(invitationId);

    try {
      await revokeInvitation.mutateAsync({ teamId, invitationId });
      toast.success(t`Invitation revoked.`);

      await refreshInvites();

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t`Unable to revoke the invitation right now.`,
      );

      return false;
    } finally {
      setActiveRevokeId(null);
    }
  };

  if (teamQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
        <p className="text-sm text-neutral-600">{t`Loading current team…`}</p>
      </main>
    );
  }

  if (teamQuery.isError) {
    let description = t`Unable to load the current team.`;

    if (teamQuery.error instanceof ApiRequestError && teamQuery.error.status === 404) {
      description = t`You do not currently have an active team.`;
    } else if (
      teamQuery.error instanceof ApiRequestError &&
      teamQuery.error.status === MULTIPLE_ACTIVE_TEAMS_STATUS
    ) {
      description = t`Multiple active teams were found for your account, so invite management is blocked until that is fixed.`;
    } else if (teamQuery.error instanceof Error) {
      description = teamQuery.error.message;
    }

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <Card className="w-full border-red-200 bg-red-50 shadow-none">
          <CardContent className="space-y-4 p-6 text-red-700">
            <h1 className="text-2xl font-semibold">{t`Team invite management is unavailable`}</h1>
            <p>{description}</p>
            <Button type="button" onClick={() => void teamQuery.refetch()}>
              {t`Retry`}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const team = teamQuery.data;

  if (!team) {
    return null;
  }

  const memberSummary = team.members?.length
    ? t`${team.members.length} members currently attached to this team.`
    : t`No member summary was returned for this team.`;
  const invitationList = invitationsQuery.data?.data ?? [];
  const meta = invitationsQuery.data?.meta;
  const canCreateInvitations =
    parsedEmails.validEmails.length > 0 && parsedEmails.invalidEmails.length === 0;

  let invitationContent = null;

  if (invitationsQuery.isLoading) {
    invitationContent = <p className="text-sm text-neutral-600">{t`Loading invitations…`}</p>;
  } else if (invitationList.length === 0) {
    invitationContent = (
      <div className="rounded-xl border border-dashed border-black/15 bg-[#f6f7f8] p-6 text-sm text-neutral-600">
        {t`No invitations match the current filters.`}
      </div>
    );
  } else {
    invitationContent = invitationList.map((invitation) => (
      <TeamInvitationRow
        key={invitation.id}
        invitation={invitation}
        locale={i18n.locale}
        isResending={activeResendId === invitation.id}
        isRevoking={activeRevokeId === invitation.id}
        onResend={handleResend}
        onRevoke={handleRevoke}
      />
    ));
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="border-black/10 bg-white shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl text-[#0c1a4f]">{t`Invite teammates`}</CardTitle>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {t`Create one or more student invitations for your current team. Separate emails with commas, spaces, or new lines.`}
                </p>
              </div>

              <Button asChild type="button" variant="outline" className="shrink-0">
                <Link href={ROUTES.DASHBOARD}>{t`Continue to dashboard`}</Link>
              </Button>
            </div>

            <div className="rounded-xl border border-[#1e58d5]/12 bg-[#f4f8ff] px-4 py-3 text-sm text-[#23407b]">
              {t`This step is optional. You can continue to the dashboard now and come back to invites later.`}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-black/10 bg-[#f5f6f8] p-4">
              <p className="text-xs font-medium tracking-[0.1em] text-neutral-500 uppercase">
                {t`Current team`}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#0c1a4f]">{team.name}</h2>
              <p className="mt-1 text-sm text-neutral-600">{memberSummary}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase">
                {t`Emails`}
              </label>
              <Textarea
                value={emailsText}
                onChange={(event) => setEmailsText(event.target.value)}
                placeholder={t`student1@example.com\nstudent2@example.com…`}
                spellCheck={false}
                className="min-h-44 rounded-sm border-black/10 bg-white"
              />
            </div>

            <div className="rounded-xl border border-black/10 bg-[#f8fafc] px-4 py-3 text-sm text-neutral-600">
              <p>
                {t`Valid emails`}:{' '}
                <span className="font-medium text-neutral-900">
                  {parsedEmails.validEmails.length}
                </span>
              </p>
              {parsedEmails.duplicateCount > 0 ? (
                <p className="mt-1">{t`Duplicate entries will be ignored automatically.`}</p>
              ) : null}
              {parsedEmails.invalidEmails.length > 0 ? (
                <p className="mt-1 text-red-700" aria-live="polite">
                  {t`Fix invalid emails before creating invites:`}{' '}
                  {parsedEmails.invalidEmails.join(', ')}
                </p>
              ) : null}
            </div>

            {createError ? (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                aria-live="polite"
              >
                {createError}
              </div>
            ) : null}

            <Button
              type="button"
              disabled={createInvitations.isPending || !canCreateInvitations}
              onClick={() => void handleCreateInvites()}
              className="w-full bg-[#1e58d5] hover:bg-[#245fdc]"
            >
              {createInvitations.isPending ? t`Creating…` : t`Create invitations`}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-black/10 bg-white shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle className="text-2xl text-[#0c1a4f]">{t`Current invitations`}</CardTitle>
                <p className="mt-2 text-sm text-neutral-600">
                  {t`Track invite state, resend pending invites, and revoke active ones.`}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[220px_180px]">
                <Input
                  value={search}
                  onChange={(event) => {
                    const nextValue = event.target.value;

                    setPage(1);
                    setSearch(nextValue);
                    updateUrlState({ q: nextValue, page: 1 });
                  }}
                  placeholder={t`Search by email…`}
                  autoComplete="off"
                  inputMode="email"
                  spellCheck={false}
                />
                <Select
                  value={status}
                  onValueChange={(value) => {
                    const nextStatus = value as 'ALL' | TeamInvitationStatus;

                    setPage(1);
                    setStatus(nextStatus);
                    updateUrlState({ status: nextStatus, page: 1 });
                  }}
                >
                  <SelectTrigger className="h-10 rounded-sm border-black/10 bg-white">
                    <SelectValue placeholder={t`All statuses`} />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitationContent}

            {meta ? (
              <div className="flex items-center justify-between gap-4 border-t border-black/8 pt-4 text-sm text-neutral-600">
                <span>
                  {t`Page`} {meta.page} {t`of`} {meta.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => {
                      const nextPage = Math.max(page - 1, 1);

                      setPage(nextPage);
                      updateUrlState({ page: nextPage });
                    }}
                  >
                    {t`Previous`}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={page >= meta.totalPages}
                    onClick={() => {
                      const nextPage = page + 1;

                      setPage(nextPage);
                      updateUrlState({ page: nextPage });
                    }}
                  >
                    {t`Next`}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
