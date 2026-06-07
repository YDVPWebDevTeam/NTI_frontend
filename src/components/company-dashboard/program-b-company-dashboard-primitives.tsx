'use client';

import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { StatusBadge, type StatusBadgeTone } from 'components/shadcn/status-badge';
import { formatEnumLabel } from 'lib/utils';

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
const COMPANY_STATUS_TONES: Record<string, StatusBadgeTone> = {
  ACTIVE: 'success',
  ACCEPTED: 'success',
  DONE: 'success',
  COMPLETED: 'success',
  UPLOADED: 'success',
  PUBLISHED: 'info',
  IN_PAIRING: 'brand',
  IN_PROGRESS: 'info',
  ASSIGNED: 'info',
  IN_REALIZATION: 'info',
  SHORTLISTED: 'brand',
  SUBMITTED: 'warning',
  PENDING: 'warning',
  PLANNED: 'warning',
  BLOCKED: 'danger',
  REJECTED: 'danger',
  FAILED: 'danger',
  CLOSED: 'neutral',
  ARCHIVED: 'neutral',
  DRAFT: 'neutral',
};

export function CompanyDashboardSection({
  title,
  description,
  action,
  children,
}: CompanyDashboardSectionProps) {
  return (
    <article className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-foreground text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm leading-7">{description}</p>
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
      ? 'border-destructive/30 bg-destructive/5 text-destructive'
      : 'border-border bg-muted/40 text-muted-foreground';

  return (
    <div
      className={`flex min-h-36 flex-col items-center justify-center rounded-2xl border px-6 py-8 text-center ${toneClasses}`}
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
    <article className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-foreground mt-3 text-3xl font-semibold">{value}</p>
        </div>
        <div className="bg-accent text-primary rounded-2xl p-3">{icon}</div>
      </div>
      <p className="text-muted-foreground mt-4 text-sm leading-6">{hint}</p>
    </article>
  );
}

export function CompanyDashboardLoadingCard() {
  return <div className="bg-muted h-32 animate-pulse rounded-2xl" />;
}

export function CompanyStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge tone={COMPANY_STATUS_TONES[status] ?? 'neutral'} className="uppercase">
      {formatEnumLabel(status)}
    </StatusBadge>
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
