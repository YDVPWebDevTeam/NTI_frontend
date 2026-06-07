import { t } from '@lingui/core/macro';

import { StatusBadge, type StatusBadgeTone } from 'components/shadcn/status-badge';

type ProgramAStatusBadgeProps = {
  status: string | null | undefined;
};

type KnownProgramAStatus =
  | 'ACTIVE_PROJECT'
  | 'APPROVED'
  | 'ARCHIVED'
  | 'COMPLETED'
  | 'DRAFT'
  | 'EVALUATING'
  | 'FORMALLY_VERIFIED'
  | 'NEEDS_INFO'
  | 'ONBOARDING'
  | 'PAUSED'
  | 'REJECTED'
  | 'SUBMITTED';

const statusTones: Record<KnownProgramAStatus, StatusBadgeTone> = {
  ACTIVE_PROJECT: 'info',
  APPROVED: 'success',
  ARCHIVED: 'neutral',
  COMPLETED: 'success',
  DRAFT: 'neutral',
  EVALUATING: 'brand',
  FORMALLY_VERIFIED: 'info',
  NEEDS_INFO: 'warning',
  ONBOARDING: 'info',
  PAUSED: 'warning',
  REJECTED: 'danger',
  SUBMITTED: 'brand',
};

function isKnownProgramAStatus(status: string): status is KnownProgramAStatus {
  return Object.prototype.hasOwnProperty.call(statusTones, status);
}

function getProgramAStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE_PROJECT':
      return t`Active project`;

    case 'APPROVED':
      return t`Approved`;

    case 'ARCHIVED':
      return t`Archived`;

    case 'COMPLETED':
      return t`Completed`;

    case 'DRAFT':
      return t`Draft`;

    case 'EVALUATING':
      return t`Evaluating`;

    case 'FORMALLY_VERIFIED':
      return t`Formally verified`;

    case 'NEEDS_INFO':
      return t`Needs info`;

    case 'REJECTED':
      return t`Rejected`;

    case 'SUBMITTED':
      return t`Submitted`;

    case 'ONBOARDING':
      return t`Onboarding`;

    case 'PAUSED':
      return t`Paused`;

    default:
      return status;
  }
}

export function ProgramAStatusBadge({ status }: ProgramAStatusBadgeProps) {
  const normalizedStatus = status?.trim() || 'UNKNOWN';
  const tone: StatusBadgeTone = isKnownProgramAStatus(normalizedStatus)
    ? statusTones[normalizedStatus]
    : 'neutral';

  return (
    <StatusBadge tone={tone} withDot className="uppercase">
      {getProgramAStatusLabel(normalizedStatus)}
    </StatusBadge>
  );
}
