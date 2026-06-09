'use client';

import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { toast } from 'sonner';

import { AdminFilterOption } from 'lib/api-client/admin/types';
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
} from 'components/admin';
import { Button, Input } from 'components/shadcn';
import { StatusBadge, type StatusBadgeTone } from 'components/shadcn/status-badge';
import {
  useApproveUniversityEmailDomain,
  useCreateUniversityEmailDomain,
  useDeleteUniversityEmailDomain,
  useRejectUniversityEmailDomain,
  useUniversityEmailDomains,
  type UniversityEmailDomainStatus,
} from 'lib/api-client/university-email-domains';

type DomainStatusFilter = AdminFilterOption | UniversityEmailDomainStatus;

const DOMAIN_STATUS_FILTERS: readonly DomainStatusFilter[] = [
  AdminFilterOption.ALL,
  'PENDING',
  'APPROVED',
  'REJECTED',
];

const STATUS_TONE: Record<UniversityEmailDomainStatus, StatusBadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export default function AdminUniversityEmailDomainsPage() {
  const domainsQuery = useUniversityEmailDomains();
  const createMutation = useCreateUniversityEmailDomain();
  const approveMutation = useApproveUniversityEmailDomain();
  const rejectMutation = useRejectUniversityEmailDomain();
  const deleteMutation = useDeleteUniversityEmailDomain();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DomainStatusFilter>(AdminFilterOption.ALL);
  const [newDomain, setNewDomain] = useState('');

  const isMutating =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    deleteMutation.isPending ||
    createMutation.isPending;

  const domains = (domainsQuery.data ?? []).filter((domain) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 || domain.domain.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === AdminFilterOption.ALL || domain.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAdd = async () => {
    const normalized = newDomain.trim().toLowerCase();

    if (normalized.length === 0) {
      return;
    }

    try {
      await createMutation.mutateAsync(normalized);
      setNewDomain('');
      toast.success(t`Domain added.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to add the domain.`);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success(t`Domain approved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to approve the domain.`);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt(t`Reason for rejecting this domain?`)?.trim();

    if (!reason) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({ id, reason });
      toast.success(t`Domain rejected.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to reject the domain.`);
    }
  };

  const handleDelete = async (id: string, domain: string) => {
    if (!window.confirm(t`Remove "${domain}" from the list?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t`Domain removed.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to remove the domain.`);
    }
  };

  if (domainsQuery.isLoading) {
    return <AdminLoadingState />;
  }

  if (domainsQuery.isError) {
    return (
      <AdminErrorState
        title={t`University email domains are unavailable`}
        description={t`The domain list could not be loaded.`}
        actionLabel={t`Retry`}
        onAction={() => void domainsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-border bg-card flex flex-wrap items-end gap-3 rounded-md border p-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="new-domain" className="text-sm font-medium">
            {t`Add an approved domain`}
          </label>
          <Input
            id="new-domain"
            placeholder={t`e.g. ukf.sk`}
            value={newDomain}
            spellCheck={false}
            onChange={(event) => setNewDomain(event.target.value)}
          />
        </div>
        <Button
          type="button"
          disabled={createMutation.isPending || newDomain.trim().length === 0}
          onClick={() => void handleAdd()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {createMutation.isPending ? t`Adding…` : t`Add domain`}
        </Button>
      </div>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t`Search by domain`}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        filters={DOMAIN_STATUS_FILTERS}
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTableRow>
            <AdminTableHeaderCell>{t`Domain`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Status`}</AdminTableHeaderCell>
            <AdminTableHeaderCell>{t`Requested note`}</AdminTableHeaderCell>
            <AdminTableHeaderCell className="text-right">{t`Actions`}</AdminTableHeaderCell>
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {domains.map((domain) => (
            <AdminTableRow key={domain.id}>
              <AdminTableCell>
                <div className="text-foreground font-medium">{domain.domain}</div>
              </AdminTableCell>
              <AdminTableCell>
                <StatusBadge tone={STATUS_TONE[domain.status]} className="uppercase">
                  {domain.status}
                </StatusBadge>
              </AdminTableCell>
              <AdminTableCell className="text-muted-foreground max-w-xs text-xs">
                {domain.requestNote || t`—`}
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  {domain.status === 'APPROVED' ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => void handleApprove(domain.id)}
                    >
                      {t`Approve`}
                    </Button>
                  )}
                  {domain.status === 'REJECTED' ? null : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isMutating}
                      onClick={() => void handleReject(domain.id)}
                    >
                      {t`Reject`}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isMutating}
                    onClick={() => void handleDelete(domain.id, domain.domain)}
                  >
                    {t`Remove`}
                  </Button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))}
          {domains.length === 0 ? (
            <AdminTableRow>
              <AdminTableCell className="text-muted-foreground py-10 text-center" colSpan={4}>
                {t`No domains match the current filters.`}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
