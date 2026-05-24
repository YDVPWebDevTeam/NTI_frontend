'use client';

import { t } from '@lingui/core/macro';
import { Download, RefreshCcw } from 'lucide-react';

import { useReportsControllerGetExportJobStatus, ExportJobStatusDtoStatus } from 'lib/api';
import { Button } from 'components/shadcn';

import { formatAdminDateTime } from './utils';
import { AdminTableCell, AdminTableRow } from './admin-table';
import {
  getDatasetLabel,
  EXPORT_TERMINAL_STATUSES,
  POLLING_INTERVAL_MS,
  getExportJobDownloadPath,
} from './admin-reports-utils';
import { AdminReportStatusBadge } from './admin-report-status-badge';

type AdminExportJobRowProps = {
  id: string;
};

function useAdminExportJob(id: string) {
  return useReportsControllerGetExportJobStatus(id, {
    query: {
      refetchInterval: (query) => {
        const job = query.state.data;

        if (!job || EXPORT_TERMINAL_STATUSES.has(job.status)) {
          return false;
        }

        return POLLING_INTERVAL_MS;
      },
    },
  });
}

function openDownload(downloadHref: string | null) {
  if (!downloadHref) {
    return;
  }

  window.open(downloadHref, '_blank', 'noopener,noreferrer');
}

export function AdminExportJobRow({ id }: AdminExportJobRowProps) {
  const jobQuery = useAdminExportJob(id);

  if (jobQuery.isLoading) {
    return (
      <AdminTableRow className="hidden sm:table-row">
        <AdminTableCell className="font-mono text-xs text-slate-500">{id}</AdminTableCell>
        <AdminTableCell colSpan={5}>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            {t`Loading export job...`}
          </div>
        </AdminTableCell>
      </AdminTableRow>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <AdminTableRow className="hidden sm:table-row">
        <AdminTableCell className="font-mono text-xs text-slate-500">{id}</AdminTableCell>
        <AdminTableCell className="text-rose-700" colSpan={4}>
          {t`Unable to load this export job right now.`}
        </AdminTableCell>
        <AdminTableCell className="text-right">
          <Button type="button" variant="outline" size="sm" onClick={() => void jobQuery.refetch()}>
            {t`Retry`}
          </Button>
        </AdminTableCell>
      </AdminTableRow>
    );
  }

  const job = jobQuery.data;
  const downloadHref = getExportJobDownloadPath(job.id, job.downloadUrl);
  const isDownloadReady = job.status === ExportJobStatusDtoStatus.COMPLETED && !!downloadHref;

  return (
    <AdminTableRow className="hidden sm:table-row">
      <AdminTableCell className="font-mono text-xs text-slate-500">{job.id}</AdminTableCell>
      <AdminTableCell>{getDatasetLabel(job.dataset)}</AdminTableCell>
      <AdminTableCell className="uppercase">{job.format}</AdminTableCell>
      <AdminTableCell>
        <AdminReportStatusBadge status={job.status} />
      </AdminTableCell>
      <AdminTableCell>
        <div>{formatAdminDateTime(job.createdAt)}</div>
        {job.completedAt ? (
          <div className="mt-1 text-xs text-slate-500">
            {t`Completed:`} {formatAdminDateTime(job.completedAt)}
          </div>
        ) : null}
        {job.errorMessage ? (
          <div className="mt-1 text-xs text-rose-700">{job.errorMessage}</div>
        ) : null}
      </AdminTableCell>
      <AdminTableCell className="text-right">
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void jobQuery.refetch()}>
            {t`Refresh`}
          </Button>
          {isDownloadReady ? (
            <Button type="button" size="sm" onClick={() => openDownload(downloadHref)}>
              <Download className="h-4 w-4" />
              {t`Download`}
            </Button>
          ) : null}
          {jobQuery.isFetching ? (
            <div className="inline-flex items-center gap-2 rounded-md px-3 text-xs text-slate-500">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              {t`Updating`}
            </div>
          ) : null}
        </div>
      </AdminTableCell>
    </AdminTableRow>
  );
}

export function AdminExportJobCard({ id }: AdminExportJobRowProps) {
  const jobQuery = useAdminExportJob(id);

  if (jobQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          {t`Loading export job...`}
        </div>
      </div>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="font-mono text-xs break-all text-slate-500">{id}</div>
        <div className="text-sm text-rose-700">{t`Unable to load this export job right now.`}</div>
        <Button type="button" variant="outline" size="sm" onClick={() => void jobQuery.refetch()}>
          {t`Retry`}
        </Button>
      </div>
    );
  }

  const job = jobQuery.data;
  const downloadHref = getExportJobDownloadPath(job.id, job.downloadUrl);
  const isDownloadReady = job.status === ExportJobStatusDtoStatus.COMPLETED && !!downloadHref;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="font-mono text-xs break-all text-slate-500">{job.id}</div>
      <dl className="grid gap-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
              {t`Dataset`}
            </dt>
            <dd className="mt-1 text-slate-700">{getDatasetLabel(job.dataset)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
              {t`Format`}
            </dt>
            <dd className="mt-1 text-slate-700 uppercase">{job.format}</dd>
          </div>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
            {t`Status`}
          </dt>
          <dd className="mt-1">
            <AdminReportStatusBadge status={job.status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-[0.08em] text-slate-500 uppercase">
            {t`Timeline`}
          </dt>
          <dd className="mt-1 text-slate-700">{formatAdminDateTime(job.createdAt)}</dd>
          {job.completedAt ? (
            <dd className="mt-1 text-xs text-slate-500">
              {t`Completed:`} {formatAdminDateTime(job.completedAt)}
            </dd>
          ) : null}
          {job.errorMessage ? (
            <dd className="mt-1 text-xs text-rose-700">{job.errorMessage}</dd>
          ) : null}
        </div>
      </dl>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void jobQuery.refetch()}>
          {t`Refresh`}
        </Button>
        {isDownloadReady ? (
          <Button type="button" size="sm" onClick={() => openDownload(downloadHref)}>
            <Download className="h-4 w-4" />
            {t`Download`}
          </Button>
        ) : null}
      </div>
      {jobQuery.isFetching ? (
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <RefreshCcw className="h-4 w-4 animate-spin" />
          {t`Updating`}
        </div>
      ) : null}
    </div>
  );
}
