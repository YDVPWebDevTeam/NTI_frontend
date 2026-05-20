'use client';

import { Badge } from 'components/shadcn/badge';
import type { AdminStatus } from 'lib/api-client/admin/types';
import { cn } from 'lib/utils';

import { StatusTone } from './types';
import { formatStatusLabel, getStatusTone } from './utils';

type AdminStatusBadgeProps = {
  status: AdminStatus;
};

const STATUS_CLASS_NAME: Record<StatusTone, string> = {
  [StatusTone.NEUTRAL]: 'border-slate-200 bg-slate-100 text-slate-700',
  [StatusTone.SUCCESS]: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  [StatusTone.WARNING]: 'border-amber-200 bg-amber-100 text-amber-800',
  [StatusTone.DANGER]: 'border-rose-200 bg-rose-100 text-rose-800',
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const tone = getStatusTone(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]',
        STATUS_CLASS_NAME[tone],
      )}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
