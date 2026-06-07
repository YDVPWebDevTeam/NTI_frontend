'use client';

import type { ExportJobStatusDtoStatus } from 'lib/api';

import { StatusBadge } from 'components/shadcn/status-badge';
import { formatEnumLabel } from 'lib/utils';

import { EXPORT_STATUS_TONES, getExportStatusLabel } from './admin-reports-utils';

type AdminReportStatusBadgeProps = {
  status: string;
};

export function AdminReportStatusBadge({ status }: AdminReportStatusBadgeProps) {
  return (
    <StatusBadge tone={EXPORT_STATUS_TONES[status] ?? 'neutral'} className="uppercase">
      {getExportStatusLabel(status as ExportJobStatusDtoStatus) ?? formatEnumLabel(status)}
    </StatusBadge>
  );
}
