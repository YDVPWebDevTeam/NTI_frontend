'use client';

import { t } from '@lingui/core/macro';

import {
  ExportJobStatusDtoStatus,
  ReportsControllerExportReportDataset,
  ReportsControllerExportReportFormat,
  ReportsControllerGetApplicationsProgramType,
  ReportsControllerGetApplicationsSort,
  ReportsControllerGetApplicationsStatus,
  ReportsControllerGetProgramBSort,
  ReportsControllerGetProgramBStatus,
} from 'lib/api';
import type { StatusBadgeTone } from 'components/shadcn/status-badge';
import { buildApiUrl, extractApiErrorMessage } from 'lib/api-client/openapi-runtime/client';
import { formatEnumLabel } from 'lib/utils';

import { formatAdminDateTime } from './utils';
import type {
  ApplicationOrder,
  ApplicationSort,
  ApplicationStatusFilter,
  ExportFormat,
  ProgramBOrder,
  ProgramBSort,
  ProgramBStatusFilter,
  ProgramTypeFilter,
  ReportDataset,
} from './admin-reports-types';

export const ALL_FILTER = 'ALL' as const;
export const PAGE_SIZE = 20;
export const POLLING_INTERVAL_MS = 5000;
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const HTTP_STATUS_FORBIDDEN = 403;
export const REPORT_EXPORT_JOBS_STORAGE_KEY = 'nti-admin-report-export-jobs';
export const MAX_STORED_EXPORT_JOB_IDS = 20;

export const EXPORT_TERMINAL_STATUSES: ReadonlySet<string> = new Set([
  ExportJobStatusDtoStatus.COMPLETED,
  ExportJobStatusDtoStatus.FAILED,
]);

export const REPORT_DATASETS: readonly ReportDataset[] = [
  ReportsControllerExportReportDataset.applications,
  ReportsControllerExportReportDataset['program-b'],
];

export const EXPORT_FORMATS: readonly ExportFormat[] = [
  ReportsControllerExportReportFormat.csv,
  ReportsControllerExportReportFormat.xlsx,
  ReportsControllerExportReportFormat.pdf,
];

export const APPLICATION_STATUS_OPTIONS: readonly ApplicationStatusFilter[] = [
  ALL_FILTER,
  ...Object.values(ReportsControllerGetApplicationsStatus),
];

export const PROGRAM_B_STATUS_OPTIONS: readonly ProgramBStatusFilter[] = [
  ALL_FILTER,
  ...Object.values(ReportsControllerGetProgramBStatus),
];

export const PROGRAM_TYPE_OPTIONS: readonly ProgramTypeFilter[] = [
  ALL_FILTER,
  ...Object.values(ReportsControllerGetApplicationsProgramType),
];

export const APPLICATION_SORT_OPTIONS: readonly ApplicationSort[] = [
  ReportsControllerGetApplicationsSort.createdAt,
  ReportsControllerGetApplicationsSort.submittedAt,
  ReportsControllerGetApplicationsSort.decidedAt,
  ReportsControllerGetApplicationsSort.status,
];

export const PROGRAM_B_SORT_OPTIONS: readonly ProgramBSort[] = [
  ReportsControllerGetProgramBSort.createdAt,
  ReportsControllerGetProgramBSort.submittedAt,
  ReportsControllerGetProgramBSort.status,
];

export const EXPORT_STATUS_TONES: Record<string, StatusBadgeTone> = {
  [ExportJobStatusDtoStatus.PENDING]: 'warning',
  [ExportJobStatusDtoStatus.PROCESSING]: 'info',
  [ExportJobStatusDtoStatus.COMPLETED]: 'success',
  [ExportJobStatusDtoStatus.FAILED]: 'danger',
};

export function getDatasetLabel(dataset: ReportDataset) {
  return dataset === ReportsControllerExportReportDataset.applications
    ? t`Applications`
    : t`Program B`;
}

export function getSortLabel(sort: ApplicationSort | ProgramBSort) {
  if (sort === 'createdAt') {
    return t`Created`;
  }

  if (sort === 'submittedAt') {
    return t`Submitted`;
  }

  if (sort === 'decidedAt') {
    return t`Decided`;
  }

  if (sort === 'status') {
    return t`Status`;
  }

  return sort;
}

export function getOrderLabel(order: ApplicationOrder | ProgramBOrder) {
  if (order === 'asc') {
    return t`Ascending`;
  }

  if (order === 'desc') {
    return t`Descending`;
  }

  return formatEnumLabel(order);
}

export function getExportStatusLabel(status: ExportJobStatusDtoStatus) {
  switch (status) {
    case ExportJobStatusDtoStatus.PENDING:
      return t`Pending`;

    case ExportJobStatusDtoStatus.PROCESSING:
      return t`Running`;

    case ExportJobStatusDtoStatus.COMPLETED:
      return t`Complete`;

    case ExportJobStatusDtoStatus.FAILED:
      return t`Failed`;

    default:
      return formatEnumLabel(status);
  }
}

export function getDefaultExportFilename(dataset: ReportDataset, format: ExportFormat) {
  return `nti-${dataset}-report.${format}`;
}

export function formatOptionalReportDate(value: unknown) {
  return typeof value === 'string' ? formatAdminDateTime(value) : t`Not available`;
}

export function getFilenameFromDisposition(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = value.match(/filename="?([^"]+)"?/i);

  return plainMatch?.[1] ?? fallback;
}

export function getExportJobDownloadPath(jobId: string, downloadUrl?: string) {
  if (!downloadUrl) {
    return null;
  }

  try {
    const token = new URL(downloadUrl).searchParams.get('token');

    if (!token) {
      return null;
    }

    return buildApiUrl(`/reports/export-jobs/${jobId}/download?token=${encodeURIComponent(token)}`);
  } catch {
    return null;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export async function getResponseErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return extractApiErrorMessage(await response.json());
  }

  const text = await response.text();

  return text || t`Request failed`;
}
