'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminStatusBadge,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  formatAdminDateTime,
} from 'components/admin';
import { Button } from 'components/shadcn';
import { useOrganizationInvitesByOrganization } from 'lib/api-client/admin/organizations';
import { ROUTES } from 'lib/constants';
import { formatEnumLabel } from 'lib/utils';

export default function OrganizationInviteDetailPage() {
  const params = useParams<{ organizationId: string }>();
  const organizationId = params.organizationId?.trim() ?? '';
  const invitesQuery = useOrganizationInvitesByOrganization(organizationId);

  if (!organizationId) {
    return (
      <AdminErrorState
        title={t`Invalid organization id`}
        description={t`The requested organization could not be identified from the route.`}
      />
    );
  }

  if (invitesQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (invitesQuery.isError) {
    return (
      <AdminErrorState
        title={t`Organization invites unavailable`}
        description={t`The invite detail request failed for this organization.`}
        actionLabel={t`Retry`}
        onAction={() => void invitesQuery.refetch()}
      />
    );
  }

  const invites = invitesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
            {t`Organization Id`}
          </p>
          <h1 className="mt-2 font-mono text-sm text-slate-900">{organizationId}</h1>
        </div>
        <Button asChild variant="outline" className="bg-white">
          <Link href={ROUTES.ADMIN.ORGANIZATIONS}>{t`Back to Organizations`}</Link>
        </Button>
      </div>

      {invites.length === 0 ? (
        <AdminEmptyState
          title={t`No organization invites found`}
          description={t`This organization has no invite records available right now.`}
        />
      ) : (
        <AdminTable>
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableHeaderCell>{t`Email`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Role`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Created`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Expires`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Accepted`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Revoked`}</AdminTableHeaderCell>
            </AdminTableRow>
          </AdminTableHead>
          <AdminTableBody>
            {invites.map((invite) => (
              <AdminTableRow key={invite.id}>
                <AdminTableCell className="font-medium text-slate-950">
                  {invite.email}
                </AdminTableCell>
                <AdminTableCell>{formatEnumLabel(invite.roleToAssign)}</AdminTableCell>
                <AdminTableCell>
                  <AdminStatusBadge status={invite.status} />
                </AdminTableCell>
                <AdminTableCell>{formatAdminDateTime(invite.createdAt)}</AdminTableCell>
                <AdminTableCell>{formatAdminDateTime(invite.expiresAt)}</AdminTableCell>
                <AdminTableCell>{formatAdminDateTime(invite.acceptedAt)}</AdminTableCell>
                <AdminTableCell>{formatAdminDateTime(invite.revokedAt)}</AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  );
}
