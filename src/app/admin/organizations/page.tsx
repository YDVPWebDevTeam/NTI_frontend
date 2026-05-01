'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import { useState } from 'react';

import {
  AdminFilterOption,
  OrganizationStatus,
  organizationStatusFilters,
} from 'lib/api/admin/types';
import {
  AdminFilterBar,
  AdminErrorState,
  useHandleAdminSessionFailure,
  AdminLoadingState,
  AdminStatusBadge,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  OrganizationRejectionForm,
} from 'components/admin';
import { Button } from 'components/shadcn';
import { useChangeOrganizationStatus, useOrganizationInvites } from 'lib/api/admin/organizations';
import { ROUTES } from 'lib/constants';

import type { OrganizationStatusFilter } from 'lib/api/admin/types';

export default function AdminOrganizationsPage() {
  const organizationsQuery = useOrganizationInvites();
  const changeStatusMutation = useChangeOrganizationStatus();
  const handleSessionFailure = useHandleAdminSessionFailure();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizationStatusFilter>(AdminFilterOption.ALL);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const organizations = (organizationsQuery.data ?? []).filter((organization) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      organization.name.toLowerCase().includes(normalizedSearch) ||
      organization.id.toLowerCase().includes(normalizedSearch) ||
      organization.website?.toLowerCase().includes(normalizedSearch) ||
      organization.sector?.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === AdminFilterOption.ALL || organization.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (organizationsQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (organizationsQuery.isError) {
    return (
      <AdminErrorState
        title={t`Organizations are unavailable`}
        description={t`The review queue could not be loaded.`}
        actionLabel={t`Retry`}
        onAction={() => void organizationsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t`Search by name, website, sector, or id`}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        filters={organizationStatusFilters}
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTableRow>
            <AdminTableHeaderCell>{t`Organization`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Sector`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Website`}</AdminTableHeaderCell>
            <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {organizations.map((organization) => {
            const isPendingRow =
              changeStatusMutation.isPending &&
              changeStatusMutation.variables?.id === organization.id;

            return (
              <AdminTableRow key={organization.id}>
                <AdminTableCell>
                  <div className="font-medium text-slate-950">{organization.name}</div>
                  <div className="mt-1 font-mono text-xs text-slate-500">{organization.id}</div>
                  {organization.description ? (
                    <div className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      {organization.description}
                    </div>
                  ) : null}
                  {rejectingId === organization.id ? (
                    <div className="mt-3 max-w-xl">
                      <OrganizationRejectionForm
                        disabled={isPendingRow}
                        onCancel={() => setRejectingId(null)}
                        onSubmit={async (reason) => {
                          try {
                            await changeStatusMutation.mutateAsync({
                              id: organization.id,
                              status: OrganizationStatus.REJECTED,
                              rejectionReason: reason,
                            });
                            setRejectingId(null);
                          } catch (error) {
                            await handleSessionFailure(
                              error,
                              t`Unable to update the organization.`,
                            );
                          }
                        }}
                      />
                    </div>
                  ) : null}
                </AdminTableCell>
                <AdminTableCell>{organization.sector || t`Not provided`}</AdminTableCell>
                <AdminTableCell>
                  <AdminStatusBadge status={organization.status} />
                </AdminTableCell>
                <AdminTableCell>
                  {organization.website ? (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-700 underline-offset-4 hover:underline"
                    >
                      {organization.website}
                    </a>
                  ) : (
                    t`Not provided`
                  )}
                </AdminTableCell>
                <AdminTableCell className="space-y-2 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPendingRow}
                      onClick={() =>
                        changeStatusMutation
                          .mutateAsync({ id: organization.id, status: OrganizationStatus.ACTIVE })
                          .catch((error) =>
                            handleSessionFailure(error, t`Unable to update the organization.`),
                          )
                      }
                    >
                      {isPendingRow &&
                      changeStatusMutation.variables?.status === OrganizationStatus.ACTIVE
                        ? t`Approving...`
                        : t`Approve`}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isPendingRow}
                      onClick={() =>
                        setRejectingId((current) =>
                          current === organization.id ? null : organization.id,
                        )
                      }
                    >
                      {t`Reject`}
                    </Button>
                    <Button asChild type="button" variant="ghost" size="sm">
                      <Link href={ROUTES.ADMIN.organizationDetails(organization.id)}>
                        {t`View Invites`}
                      </Link>
                    </Button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
          {organizations.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell className="py-10 text-center text-slate-500" colSpan={5}>
                {t`No organizations match the current filters.`}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
