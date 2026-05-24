'use client';

import { Badge } from 'components/shadcn';
import { cn, formatEnumLabel } from 'lib/utils';

import { EXPORT_STATUS_CLASS_NAMES, EXPORT_STATUS_LABELS } from './admin-reports-utils';

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
      {EXPORT_STATUS_LABELS[status] ?? formatEnumLabel(status)}
    </Badge>
  );
}
