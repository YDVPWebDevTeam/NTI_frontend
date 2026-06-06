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
          <div className="inline-flex rounded-full border border-[#d7e4ff] bg-[#f4f8ff] px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#1f56c2] uppercase">
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
        'flex min-h-32 flex-col items-center justify-center gap-3 rounded-[1.5rem] border px-6 py-8 text-center',
        tone === 'error'
          ? 'border-red-200 bg-red-50/80 text-red-700'
          : 'border-[#dce5fb] bg-[linear-gradient(135deg,#f7faff_0%,#eef4ff_100%)] text-[#5b667b]',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          tone === 'error' ? 'bg-red-100 text-red-600' : 'bg-white text-[#1f56c2]',
        )}
      >
        {tone === 'error' ? <AlertCircle className="h-5 w-5" /> : <Loader2 className="h-5 w-5" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#10213d]">{title}</p>
        <p className={cn('max-w-xl text-sm leading-6', tone === 'error' ? 'text-red-700' : '')}>
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
    <div className="flex min-h-32 items-center justify-center rounded-[1.5rem] border border-[#dce5fb] bg-[linear-gradient(135deg,#f7faff_0%,#eef4ff_100%)] px-6 py-8 text-sm font-medium text-[#5b667b]">
      <Loader2 className="mr-3 h-4 w-4 animate-spin text-[#1f56c2]" />
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
        <div key={item.label} className="rounded-2xl border border-[#e6ecfb] bg-[#fbfcff] p-4">
          <dt className="text-[11px] font-semibold tracking-[0.14em] text-[#6c7c99] uppercase">
            {item.label}
          </dt>
          <dd className="mt-2 text-sm leading-6 font-medium text-[#10213d]">
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
