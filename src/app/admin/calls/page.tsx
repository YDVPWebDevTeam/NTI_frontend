'use client';

import { t } from '@lingui/core/macro';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  AdminEmptyState,
  AdminErrorState,
  AdminFilterBar,
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
import {
  AdminCallStatus,
  useArchiveAdminCall,
  useCloseAdminCall,
  useOpenAdminCall,
  useAdminCalls,
} from 'lib/api-client/admin/calls';
import {
  AdminFilterOption,
  callStatusFilters,
  type CallStatusFilter,
} from 'lib/api-client/admin/types';
import { ROUTES } from 'lib/constants';
import { formatEnumLabel } from 'lib/utils';

export default function AdminCallsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CallStatusFilter>(AdminFilterOption.ALL);

  const callsQuery = useAdminCalls();

  const openMutation = useOpenAdminCall();
  const closeMutation = useCloseAdminCall();
  const archiveMutation = useArchiveAdminCall();

  const calls = callsQuery.data?.data ?? [];

  const filteredCalls = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return calls.filter((call) => {
      const matchesSearch =
        normalizedSearch.length === 0 || call.title.toLowerCase().includes(normalizedSearch);

      const matchesStatus = status === AdminFilterOption.ALL || call.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [calls, search, status]);

  if (callsQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (callsQuery.isError) {
    return (
      <AdminErrorState
        title={t`Calls unavailable`}
        description={t`The call management request failed.`}
        actionLabel={t`Retry`}
        onAction={() => void callsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
            {t`Admin workspace`}
          </p>
          <h1 className="text-foreground mt-2 text-2xl font-semibold">{t`Calls`}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t`Manage Program A and Program B calls, deadlines, and lifecycle status.`}
          </p>
        </div>

        <Button asChild>
          <Link href={ROUTES.ADMIN.CALL_CREATE}>
            <Plus className="mr-2 h-4 w-4" />
            {t`Create call`}
          </Link>
        </Button>
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t`Search by call title`}
        status={status}
        onStatusChange={setStatus}
        filters={callStatusFilters}
      />

      {filteredCalls.length === 0 ? (
        <AdminEmptyState
          title={t`No calls found`}
          description={t`No calls match the selected filters.`}
        />
      ) : (
        <AdminTable>
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableHeaderCell>{t`Title`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Type`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Opens`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Closes`}</AdminTableHeaderCell>
              <AdminTableHeaderCell>{t`Updated`}</AdminTableHeaderCell>
              <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
            </AdminTableRow>
          </AdminTableHead>

          <AdminTableBody>
            {filteredCalls.map((call) => (
              <AdminTableRow key={call.id}>
                <AdminTableCell className="text-foreground font-medium">
                  <Link href={ROUTES.ADMIN.callDetails(call.id)} className="hover:underline">
                    {call.title}
                  </Link>
                </AdminTableCell>

                <AdminTableCell>{formatEnumLabel(call.type)}</AdminTableCell>

                <AdminTableCell>
                  <AdminStatusBadge status={call.status} />
                </AdminTableCell>

                <AdminTableCell>{formatAdminDateTime(call.opensAt)}</AdminTableCell>
                <AdminTableCell>{formatAdminDateTime(call.closesAt)}</AdminTableCell>
                <AdminTableCell>{formatAdminDateTime(call.updatedAt)}</AdminTableCell>

                <AdminTableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={ROUTES.ADMIN.callDetails(call.id)}>{t`View`}</Link>
                    </Button>

                    <Button asChild size="sm" variant="outline">
                      <Link href={ROUTES.ADMIN.callEdit(call.id)}>{t`Edit`}</Link>
                    </Button>

                    {call.status === AdminCallStatus.DRAFT ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={openMutation.isPending && openMutation.variables === call.id}
                        onClick={() => openMutation.mutate(call.id)}
                      >
                        {t`Open`}
                      </Button>
                    ) : null}

                    {call.status === AdminCallStatus.OPEN ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={closeMutation.isPending && closeMutation.variables === call.id}
                        onClick={() => closeMutation.mutate(call.id)}
                      >
                        {t`Close`}
                      </Button>
                    ) : null}

                    {call.status === AdminCallStatus.CLOSED ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          archiveMutation.isPending && archiveMutation.variables === call.id
                        }
                        onClick={() => {
                          if (
                            !window.confirm(
                              t`Archive "${call.title}"? Archiving is terminal and cannot be undone.`,
                            )
                          ) {
                            return;
                          }

                          archiveMutation.mutate(call.id);
                        }}
                      >
                        {t`Archive`}
                      </Button>
                    ) : null}
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  );
}
