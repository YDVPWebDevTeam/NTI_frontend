import { t } from '@lingui/core/macro';

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

const statusStyles: Record<KnownProgramAStatus, string> = {
  ACTIVE_PROJECT: 'border-blue-200 bg-blue-50 text-blue-700',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ARCHIVED: 'border-zinc-200 bg-zinc-50 text-zinc-600',
  COMPLETED: 'border-violet-200 bg-violet-50 text-violet-700',
  DRAFT: 'border-slate-200 bg-slate-50 text-slate-700',
  EVALUATING: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  FORMALLY_VERIFIED: 'border-sky-200 bg-sky-50 text-sky-700',
  NEEDS_INFO: 'border-amber-200 bg-amber-50 text-amber-700',
  ONBOARDING: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  PAUSED: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  SUBMITTED: 'border-orange-200 bg-orange-50 text-orange-700',
};

const fallbackStyle = 'border-slate-200 bg-slate-50 text-slate-700';

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

function isKnownProgramAStatus(status: string): status is KnownProgramAStatus {
  return Object.prototype.hasOwnProperty.call(statusStyles, status);
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
  const statusStyle = isKnownProgramAStatus(normalizedStatus)
    ? statusStyles[normalizedStatus]
    : fallbackStyle;

  return (
    <span
      className={joinClassNames(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase',
        statusStyle,
      )}
    >
      {getProgramAStatusLabel(normalizedStatus)}
    </span>
  );
}
