'use client';

import { t } from '@lingui/core/macro';
import { useState } from 'react';

import {
  AdminErrorState,
  AdminFilterBar,
  AdminLoadingState,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  useHandleAdminSessionFailure,
} from 'components/admin';
import { AdminFilterOption } from 'lib/api-client/admin/types';
import { Badge, Button } from 'components/shadcn';
import {
  type ContactSubmissionDto,
  type ContactSubmissionStatus,
  useContactSubmissions,
  useUpdateContactStatus,
} from 'lib/api-client/contact';
import { formatDate, DATE_FORMATS } from 'lib/date';

type StatusFilter = ContactSubmissionStatus | typeof AdminFilterOption.ALL;

const STATUS_FILTERS = [
  AdminFilterOption.ALL,
  'NEW',
  'REVIEWED',
  'RESOLVED',
] as const satisfies readonly StatusFilter[];

function statusBadgeVariant(status: ContactSubmissionStatus) {
  if (status === 'NEW') return 'default';
  if (status === 'REVIEWED') return 'secondary';

  return 'outline';
}

function nextStatus(current: ContactSubmissionStatus): ContactSubmissionStatus {
  if (current === 'NEW') return 'REVIEWED';
  if (current === 'REVIEWED') return 'RESOLVED';

  return 'NEW';
}

function nextStatusLabel(current: ContactSubmissionStatus) {
  if (current === 'NEW') return t`Mark reviewed`;
  if (current === 'REVIEWED') return t`Mark resolved`;

  return t`Reopen`;
}

export default function AdminContactPage() {
  const submissionsQuery = useContactSubmissions();
  const updateStatusMutation = useUpdateContactStatus();
  const handleSessionFailure = useHandleAdminSessionFailure();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(AdminFilterOption.ALL);

  const submissions: ContactSubmissionDto[] = (submissionsQuery.data ?? []).filter(
    (s: ContactSubmissionDto) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        (s.topic ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === AdminFilterOption.ALL || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    },
  );

  if (submissionsQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (submissionsQuery.isError) {
    return (
      <AdminErrorState
        title={t`Contact submissions unavailable`}
        description={t`The submissions list could not be loaded.`}
        actionLabel={t`Retry`}
        onAction={() => void submissionsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t`Search by name, email, subject or topic`}
        status={statusFilter}
        onStatusChange={(v) => setStatusFilter(v)}
        filters={STATUS_FILTERS}
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTableRow>
            <AdminTableHeaderCell>{t`Name`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Email`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Subject`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Topic`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Received`}</AdminTableHeaderCell>
            <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {submissions.map((s) => {
            const isPendingRow =
              updateStatusMutation.isPending &&
              (updateStatusMutation.variables as { id: string } | undefined)?.id === s.id;

            return (
              <AdminTableRow key={s.id}>
                <AdminTableCell className="text-foreground font-medium">{s.name}</AdminTableCell>
                <AdminTableCell className="text-muted-foreground">{s.email}</AdminTableCell>
                <AdminTableCell className="max-w-48 truncate">{s.subject}</AdminTableCell>
                <AdminTableCell>
                  {s.topic ? (
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium">
                      {s.topic}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </AdminTableCell>
                <AdminTableCell>
                  <Badge variant={statusBadgeVariant(s.status)}>{s.status}</Badge>
                </AdminTableCell>
                <AdminTableCell className="text-muted-foreground text-xs">
                  {formatDate(s.createdAt, DATE_FORMATS.ISO_DATE)}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPendingRow}
                    onClick={() =>
                      updateStatusMutation
                        .mutateAsync({ id: s.id, status: nextStatus(s.status) })
                        .catch((err: unknown) =>
                          handleSessionFailure(err, t`Unable to update status.`),
                        )
                    }
                  >
                    {isPendingRow ? t`Updating…` : nextStatusLabel(s.status)}
                  </Button>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}

          {submissions.length === 0 && (
            <AdminTableRow>
              <AdminTableCell className="text-muted-foreground py-10 text-center" colSpan={7}>
                {t`No submissions match the current filters.`}
              </AdminTableCell>
            </AdminTableRow>
          )}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
