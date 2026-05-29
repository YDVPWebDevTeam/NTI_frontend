'use client';

import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from 'components/shadcn';
import { cn, formatEnumLabel } from 'lib/utils';

type CompanyDashboardSectionProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

type CompanyDashboardStatusProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
};

type CompanyDashboardMetricCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

type CompanyDashboardPreviewStateProps<TItem> = {
  items: TItem[];
  isError: boolean;
  isLoading: boolean;
  hasData: boolean;
  renderItem: (item: TItem) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  errorDescription: string;
  errorIcon?: ReactNode;
  loadingCount?: number;
};

const DEFAULT_PREVIEW_LOADING_COUNT = 2;
const COMPANY_STATUS_BADGE_CLASS_NAMES: Record<string, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  ACCEPTED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  DONE: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  PUBLISHED: 'border-sky-200 bg-sky-50 text-sky-800',
  IN_PAIRING: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  IN_PROGRESS: 'border-blue-200 bg-blue-50 text-blue-800',
  ASSIGNED: 'border-blue-200 bg-blue-50 text-blue-800',
  IN_REALIZATION: 'border-blue-200 bg-blue-50 text-blue-800',
  SHORTLISTED: 'border-violet-200 bg-violet-50 text-violet-800',
  SUBMITTED: 'border-amber-200 bg-amber-50 text-amber-800',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  PLANNED: 'border-amber-200 bg-amber-50 text-amber-800',
  BLOCKED: 'border-rose-200 bg-rose-50 text-rose-800',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-800',
  FAILED: 'border-rose-200 bg-rose-50 text-rose-800',
  CLOSED: 'border-slate-200 bg-slate-100 text-slate-700',
  COMPLETED: 'border-teal-200 bg-teal-50 text-teal-800',
  ARCHIVED: 'border-slate-200 bg-slate-100 text-slate-700',
  DRAFT: 'border-zinc-200 bg-zinc-100 text-zinc-700',
  UPLOADED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export function CompanyDashboardSection({
  title,
  description,
  action,
  children,
}: CompanyDashboardSectionProps) {
  return (
    <article className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-[#10213d]">{title}</h2>
          <p className="mt-1 text-sm leading-7 text-[#60718d]">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

export function CompanyDashboardStatus({
  title,
  description,
  icon,
  tone = 'default',
}: CompanyDashboardStatusProps) {
  const toneClasses =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-[#dfe7fa] bg-[#f8fbff] text-[#60718d]';

  return (
    <div
      className={`flex min-h-36 flex-col items-center justify-center rounded-[1.5rem] border px-6 py-8 text-center ${toneClasses}`}
    >
      <div className="mb-3">{icon ?? <AlertCircle className="h-5 w-5" />}</div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 max-w-xl text-sm leading-7">{description}</p>
    </div>
  );
}

export function CompanyDashboardMetricCard({
  label,
  value,
  hint,
  icon,
}: CompanyDashboardMetricCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-[#dfe7fa] bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#60718d]">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-[#10213d]">{value}</p>
        </div>
        <div className="rounded-2xl bg-[#eef4ff] p-3 text-[#1e58d5]">{icon}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#60718d]">{hint}</p>
    </article>
  );
}

export function CompanyDashboardLoadingCard() {
  return <div className="h-32 animate-pulse rounded-[1.5rem] bg-[#eef4ff]" />;
}

export function CompanyStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]',
        COMPANY_STATUS_BADGE_CLASS_NAMES[status] ?? 'border-slate-200 bg-slate-100 text-slate-700',
      )}
    >
      {formatEnumLabel(status)}
    </Badge>
  );
}

export function CompanyDashboardPreviewState<TItem>({
  items,
  isError,
  isLoading,
  hasData,
  renderItem,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  errorIcon,
  loadingCount = DEFAULT_PREVIEW_LOADING_COUNT,
}: CompanyDashboardPreviewStateProps<TItem>) {
  if (isLoading && !hasData) {
    return (
      <div className="space-y-3">
        {Array.from({ length: loadingCount }, (_, index) => (
          <CompanyDashboardLoadingCard key={index} />
        ))}
      </div>
    );
  }

  if (isError && !hasData) {
    return (
      <CompanyDashboardStatus
        title={errorTitle}
        description={errorDescription}
        icon={errorIcon}
        tone="danger"
      />
    );
  }

  if (!items.length) {
    return <CompanyDashboardStatus title={emptyTitle} description={emptyDescription} />;
  }

  return <div className="space-y-3">{items.map(renderItem)}</div>;
}
