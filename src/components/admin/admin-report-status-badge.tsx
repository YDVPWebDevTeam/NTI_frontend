'use client';

import type { ExportJobStatusDtoStatus } from 'lib/api';

import { Badge } from 'components/shadcn';
import { cn, formatEnumLabel } from 'lib/utils';

import { EXPORT_STATUS_CLASS_NAMES, getExportStatusLabel } from './admin-reports-utils';

type AdminReportStatusBadgeProps = {
  status: string;
};

export function AdminReportStatusBadge({ status }: AdminReportStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]',
        EXPORT_STATUS_CLASS_NAMES[status] ?? 'border-slate-200 bg-slate-100 text-slate-700',
      )}
    >
      {getExportStatusLabel(status as ExportJobStatusDtoStatus) ?? formatEnumLabel(status)}
    </Badge>
  );
}
