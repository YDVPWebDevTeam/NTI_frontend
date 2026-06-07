'use client';

import { t } from '@lingui/core/macro';
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarClock,
  Plus,
  ShieldAlert,
  Users2,
} from 'lucide-react';
import Link from 'next/link';

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminStatCard,
  AdminStatusBadge,
  formatAdminDateTime,
} from 'components/admin';
import { Button, Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';
import { AdminCallStatus, useAdminCalls } from 'lib/api-client/admin/calls';
import { useOrganizationInvites } from 'lib/api-client/admin/organizations';
import { OrganizationStatus, UserAccountStatus } from 'lib/api-client/admin/types';
import { useUsers } from 'lib/api-client/admin/users';
import { ROUTES } from 'lib/constants';

const ATTENTION_PREVIEW_LIMIT = 5;
const ACTIVE_CALLS_PREVIEW_LIMIT = 5;

function ActiveCallsCard() {
  const callsQuery = useAdminCalls({
    status: AdminCallStatus.OPEN,
  });

  const activeCalls = callsQuery.data?.data?.slice(0, ACTIVE_CALLS_PREVIEW_LIMIT) ?? [];

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="bg-accent text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-full">
            <CalendarClock className="h-5 w-5" />
          </div>

          <CardTitle className="text-foreground text-2xl">{t`Active Calls`}</CardTitle>

          <p className="text-muted-foreground mt-2 text-sm">
            {t`Currently open calls receiving submissions.`}
          </p>
        </div>

        <Button asChild variant="outline" className="bg-card">
          <Link href={ROUTES.ADMIN.CALLS}>
            {t`View all calls`}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {callsQuery.isLoading ? <AdminLoadingState /> : null}

        {callsQuery.isError ? (
          <AdminErrorState
            title={t`Active calls unavailable`}
            description={t`The active calls request failed, but the rest of the dashboard is still available.`}
            actionLabel={t`Retry`}
            onAction={() => void callsQuery.refetch()}
          />
        ) : null}

        {!callsQuery.isLoading && !callsQuery.isError && activeCalls.length === 0 ? (
          <div className="space-y-4">
            <AdminEmptyState
              title={t`No active calls`}
              description={t`There are no currently open calls receiving submissions.`}
            />

            <Button asChild>
              <Link href={ROUTES.ADMIN.CALL_CREATE}>
                <Plus className="mr-2 h-4 w-4" />
                {t`Create call`}
              </Link>
            </Button>
          </div>
        ) : null}

        {!callsQuery.isLoading && !callsQuery.isError && activeCalls.length > 0 ? (
          <div className="space-y-3">
            {activeCalls.map((call) => (
              <Link
                key={call.id}
                href={ROUTES.ADMIN.callDetails(call.id)}
                className="border-border hover:border-border hover:bg-muted block rounded-2xl border px-4 py-4 transition-colors"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="text-foreground font-medium">{call.title}</div>

                    <div className="text-muted-foreground mt-1 text-sm">
                      {t`Opens`}: {formatAdminDateTime(call.opensAt)}
                    </div>
                  </div>

                  <div className="text-muted-foreground text-sm md:text-right">
                    <div>{t`Deadline`}</div>

                    <div className="text-foreground font-medium">
                      {formatAdminDateTime(call.closesAt)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const usersQuery = useUsers();
  const organizationsQuery = useOrganizationInvites();

  if (usersQuery.isLoading || organizationsQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (usersQuery.isError || organizationsQuery.isError) {
    return (
      <AdminErrorState
        title={t`Admin overview unavailable`}
        description={t`The summary queries failed. Refresh the page to try again.`}
      />
    );
  }

  const users = usersQuery.data ?? [];
  const organizations = organizationsQuery.data ?? [];
  const activeUsers = users.filter((user) => user.status === UserAccountStatus.ACTIVE).length;
  const suspendedUsers = users.filter((user) => user.status === UserAccountStatus.SUSPENDED).length;
  const activeOrganizations = organizations.filter(
    (organization) => organization.status === OrganizationStatus.ACTIVE,
  ).length;
  const attentionRequired = organizations.filter(
    (organization) => organization.status !== OrganizationStatus.ACTIVE,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={t`Total Users`}
          value={users.length}
          description={t`${activeUsers} active accounts across the platform.`}
          icon={<Users2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label={t`Suspended Users`}
          value={suspendedUsers}
          description={t`Accounts currently blocked from normal access.`}
          icon={<ShieldAlert className="h-5 w-5" />}
        />
        <AdminStatCard
          label={t`Organizations`}
          value={organizations.length}
          description={t`${activeOrganizations} organizations are currently active.`}
          icon={<Building2 className="h-5 w-5" />}
        />
        <AdminStatCard
          label={t`Review Queue`}
          value={attentionRequired.length}
          description={t`Organizations waiting for review or already rejected.`}
          icon={<Activity className="h-5 w-5" />}
        />
      </section>

      <ActiveCallsCard />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-2xl">{t`Attention Required`}</CardTitle>
              <p className="text-muted-foreground mt-2 text-sm">
                {t`Recent organizations that still need an operational decision.`}
              </p>
            </div>
            <Button asChild variant="outline" className="bg-card">
              <Link href={ROUTES.ADMIN.ORGANIZATIONS}>
                {t`Open Queue`}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {attentionRequired.length === 0 ? (
              <AdminEmptyState
                title={t`No organizations need review`}
                description={t`Everything is up to date right now.`}
              />
            ) : (
              <div className="space-y-3">
                {attentionRequired.slice(0, ATTENTION_PREVIEW_LIMIT).map((organization) => (
                  <div
                    key={organization.id}
                    className="border-border flex flex-col gap-3 rounded-2xl border px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-foreground font-medium">{organization.name}</div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        {organization.sector || t`No sector provided`}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <AdminStatusBadge status={organization.status} />
                      <Button asChild variant="outline" size="sm" className="bg-card">
                        <Link href={ROUTES.ADMIN.organizationDetails(organization.id)}>
                          {t`View Invites`}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl">{t`Quick Links`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                href: ROUTES.ADMIN.REPORTS,
                title: t`Open Reports`,
                description: t`Inspect KPI rollups, compare report datasets, and manage export jobs.`,
              },
              {
                href: ROUTES.ADMIN.USERS,
                title: t`Manage Users`,
                description: t`Search accounts, inspect roles, and suspend or reactivate access.`,
              },
              {
                href: ROUTES.ADMIN.CALLS,
                title: t`Manage Calls`,
                description: t`Review active calls, deadlines, and lifecycle status.`,
              },
              {
                href: ROUTES.ADMIN.INVITES,
                title: t`Create System Invite`,
                description: t`Generate a direct invite for any supported platform role.`,
              },
              {
                href: ROUTES.ADMIN.ORGANIZATIONS,
                title: t`Review Organizations`,
                description: t`Approve or reject organization onboarding requests.`,
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-border hover:border-border hover:bg-muted block rounded-2xl border px-4 py-4 transition-colors"
              >
                <div className="text-foreground font-medium">{link.title}</div>
                <div className="text-muted-foreground mt-1 text-sm leading-6">
                  {link.description}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
