import { Badge } from 'components/shadcn';

type ProgramAStatusBadgeProps = {
  status: string;
};

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return 'border-amber-200 bg-amber-50 text-amber-700';

    case 'FORMALLY_VERIFIED':
      return 'border-sky-200 bg-sky-50 text-sky-700';

    case 'EVALUATING':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';

    case 'NEEDS_INFO':
      return 'border-orange-200 bg-orange-50 text-orange-700';

    case 'APPROVED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'REJECTED':
      return 'border-red-200 bg-red-50 text-red-700';

    case 'ONBOARDING':
      return 'border-blue-200 bg-blue-50 text-blue-700';

    case 'ACTIVE_PROJECT':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'PAUSED':
      return 'border-yellow-200 bg-yellow-50 text-yellow-700';

    case 'COMPLETED':
      return 'border-violet-200 bg-violet-50 text-violet-700';

    case 'ARCHIVED':
      return 'border-slate-200 bg-slate-100 text-slate-600';

    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

export function ProgramAStatusBadge({ status }: ProgramAStatusBadgeProps) {
  return (
    <Badge variant="outline" className={getStatusBadgeClass(status)}>
      {status}
    </Badge>
  );
}
