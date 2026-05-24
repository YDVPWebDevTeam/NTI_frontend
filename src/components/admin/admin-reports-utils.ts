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
import { buildApiUrl, extractApiErrorMessage } from 'lib/api-client/openapi-runtime/client';
import { formatEnumLabel } from 'lib/utils';

import { formatAdminDateTime } from './utils';
import type {
  ApplicationSort,
  ApplicationStatusFilter,
  ExportFormat,
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

const SORT_LABELS: Record<string, string> = {
  createdAt: 'Created',
  submittedAt: 'Submitted',
  decidedAt: 'Decided',
  status: 'Status',
};

const ORDER_LABELS: Record<string, string> = {
  asc: 'Ascending',
  desc: 'Descending',
};

export const EXPORT_STATUS_LABELS: Record<string, string> = {
  [ExportJobStatusDtoStatus.PENDING]: 'Pending',
  [ExportJobStatusDtoStatus.PROCESSING]: 'Running',
  [ExportJobStatusDtoStatus.COMPLETED]: 'Complete',
  [ExportJobStatusDtoStatus.FAILED]: 'Failed',
};

export const EXPORT_STATUS_CLASS_NAMES: Record<string, string> = {
  [ExportJobStatusDtoStatus.PENDING]: 'border-amber-200 bg-amber-100 text-amber-800',
  [ExportJobStatusDtoStatus.PROCESSING]: 'border-sky-200 bg-sky-100 text-sky-800',
  [ExportJobStatusDtoStatus.COMPLETED]: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  [ExportJobStatusDtoStatus.FAILED]: 'border-rose-200 bg-rose-100 text-rose-800',
};

export function getDatasetLabel(dataset: ReportDataset) {
  return dataset === ReportsControllerExportReportDataset.applications
    ? t`Applications`
    : t`Program B`;
}

export function getSortLabel(sort: string) {
  return SORT_LABELS[sort] ?? sort;
}

export function getOrderLabel(order: string) {
  return ORDER_LABELS[order] ?? formatEnumLabel(order);
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
