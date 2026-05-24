'use client';

import { t } from '@lingui/core/macro';
import { Activity, ArrowRight, Building2, ShieldAlert, Users2 } from 'lucide-react';
import Link from 'next/link';

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminStatCard,
  AdminStatusBadge,
} from 'components/admin';
import { Button, Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';
import { useOrganizationInvites } from 'lib/api-client/admin/organizations';
import { OrganizationStatus, UserAccountStatus } from 'lib/api-client/admin/types';
import { useUsers } from 'lib/api-client/admin/users';
import { ROUTES } from 'lib/constants';

const ATTENTION_PREVIEW_LIMIT = 5;

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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-950">{t`Attention Required`}</CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                {t`Recent organizations that still need an operational decision.`}
              </p>
            </div>
            <Button asChild variant="outline" className="bg-white">
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
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-950">{organization.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {organization.sector || t`No sector provided`}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <AdminStatusBadge status={organization.status} />
                      <Button asChild variant="outline" size="sm" className="bg-white">
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

        <Card className="border-slate-200 bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-950">{t`Quick Links`}</CardTitle>
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
                className="block rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="font-medium text-slate-950">{link.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{link.description}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
