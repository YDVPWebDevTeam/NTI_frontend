'use client';

import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { AdminFilterOption, UserAccountStatus, userStatusFilters } from 'lib/api/admin/types';
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
} from 'components/admin';
import { Button } from 'components/shadcn';
import { UserRole } from 'lib/api/admin/auth';
import { useChangeUserStatus, useUsers } from 'lib/api/admin/users';
import { formatEnumLabel } from 'lib/utils';

import type { UserStatusFilter } from 'lib/api/admin/types';

export default function AdminUsersPage() {
  const usersQuery = useUsers();
  const changeStatusMutation = useChangeUserStatus();
  const handleSessionFailure = useHandleAdminSessionFailure();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>(AdminFilterOption.ALL);

  const users = (usersQuery.data ?? []).filter((user) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      user.id.toLowerCase().includes(normalizedSearch) ||
      user.role.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === AdminFilterOption.ALL || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (usersQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (usersQuery.isError) {
    return (
      <AdminErrorState
        title={t`Users are unavailable`}
        description={t`The user list could not be loaded.`}
        actionLabel={t`Retry`}
        onAction={() => void usersQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t`Search by email, role, or id`}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        filters={userStatusFilters}
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTableRow>
            <AdminTableHeaderCell>{t`Email`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Role`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Id`}</AdminTableHeaderCell>
            <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {users.map((user) => {
            const nextStatus =
              user.status === UserAccountStatus.ACTIVE
                ? UserAccountStatus.SUSPENDED
                : UserAccountStatus.ACTIVE;
            const isPendingRow =
              changeStatusMutation.isPending && changeStatusMutation.variables?.id === user.id;
            const isProtectedRole = user.role === UserRole.SUPER_ADMIN;
            let actionLabel = t`Suspend`;

            if (isPendingRow) {
              actionLabel = t`Updating...`;
            } else if (isProtectedRole) {
              actionLabel = t`Protected`;
            } else if (nextStatus === UserAccountStatus.ACTIVE) {
              actionLabel = t`Activate`;
            }

            return (
              <AdminTableRow key={user.id}>
                <AdminTableCell className="font-medium text-slate-950">{user.email}</AdminTableCell>
                <AdminTableCell>{formatEnumLabel(user.role)}</AdminTableCell>
                <AdminTableCell>
                  <AdminStatusBadge status={user.status} />
                </AdminTableCell>
                <AdminTableCell className="font-mono text-xs">{user.id}</AdminTableCell>
                <AdminTableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPendingRow || isProtectedRole}
                    onClick={() =>
                      changeStatusMutation
                        .mutateAsync({ id: user.id, status: nextStatus })
                        .catch((error) =>
                          handleSessionFailure(error, t`Unable to update the user status.`),
                        )
                    }
                  >
                    {actionLabel}
                  </Button>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
          {users.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell className="py-10 text-center text-slate-500" colSpan={5}>
                {t`No users match the current filters.`}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
