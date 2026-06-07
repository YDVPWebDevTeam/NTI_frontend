'use client';

import { t } from '@lingui/core/macro';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  StudentSectionCard,
  StudentStatusCard,
} from 'components/student-dashboard/page-shell-primitives';
import { Button } from 'components/shadcn';
import { cn, formatEnumLabel } from 'lib/utils';

export function OrganizationSectionCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <StudentSectionCard title={title} description={description}>
      <div className="space-y-4">
        {badge ? (
          <div className="border-primary/25 bg-accent text-primary inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
            {badge}
          </div>
        ) : null}
        {children}
      </div>
    </StudentSectionCard>
  );
}

export function OrganizationSectionState({
  title,
  description,
  tone = 'neutral',
  action,
}: {
  title: string;
  description: string;
  tone?: 'neutral' | 'error';
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border px-6 py-8 text-center',
        tone === 'error'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-border bg-muted text-muted-foreground',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          tone === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-card text-primary',
        )}
      >
        {tone === 'error' ? <AlertCircle className="h-5 w-5" /> : <Loader2 className="h-5 w-5" />}
      </div>
      <div className="space-y-1">
        <p className="text-foreground text-sm font-semibold">{title}</p>
        <p className={cn('max-w-xl text-sm leading-6', tone === 'error' ? 'text-destructive' : '')}>
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function OrganizationErrorState({
  title = t`This section is unavailable right now.`,
  description,
  onRetry,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <OrganizationSectionState
      title={title}
      description={description}
      tone="error"
      action={
        onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            {t`Try again`}
          </Button>
        ) : null
      }
    />
  );
}

export function OrganizationLoadingState({ label }: { label: string }) {
  return (
    <div className="border-border bg-muted text-muted-foreground flex min-h-32 items-center justify-center rounded-2xl border px-6 py-8 text-sm font-medium">
      <Loader2 className="text-primary mr-3 h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function OrganizationEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <StudentStatusCard title={title} description={description} />;
}

export function OrganizationMetaList({
  items,
}: {
  items: Array<{ label: string; value: string | null | undefined }>;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="border-border bg-muted rounded-2xl border p-4">
          <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
            {item.label}
          </dt>
          <dd className="text-foreground mt-2 text-sm leading-6 font-medium">
            {item.value || t`Not provided`}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function formatOrganizationRoleLabel(role: string) {
  if (role === 'COMPANY_OWNER') {
    return t`Company owner`;
  }

  if (role === 'COMPANY_EMPLOYEE') {
    return t`Company employee`;
  }

  return formatEnumLabel(role);
}
