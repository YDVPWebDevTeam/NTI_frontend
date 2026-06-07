'use client';

import { StatusBadge, type StatusBadgeTone } from 'components/shadcn/status-badge';
import type { AdminStatus } from 'lib/api-client/admin/types';

import { StatusTone } from './types';
import { formatStatusLabel, getStatusTone } from './utils';

type AdminStatusBadgeProps = {
  status: AdminStatus;
};

const TONE_MAP: Record<StatusTone, StatusBadgeTone> = {
  [StatusTone.NEUTRAL]: 'neutral',
  [StatusTone.SUCCESS]: 'success',
  [StatusTone.WARNING]: 'warning',
  [StatusTone.DANGER]: 'danger',
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <StatusBadge tone={TONE_MAP[getStatusTone(status)]} className="uppercase">
      {formatStatusLabel(status)}
    </StatusBadge>
  );
}
