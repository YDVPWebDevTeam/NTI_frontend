'use client';

import { t } from '@lingui/core/macro';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from 'components/shadcn';

export function StudentPageShell({
  title,
  description,
  eyebrow = t`Student workspace`,
  actions,
  children,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#f4f7ff_58%,#eef8ff_100%)] shadow-[0_20px_50px_rgba(19,27,46,0.07)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#1e58d5] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#101a2e] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#526178] sm:text-[15px]">
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </section>

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function StudentSectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-[1.75rem] border border-white/85 bg-white/92 shadow-[0_14px_36px_rgba(19,27,46,0.05)]">
      <CardHeader className="border-b border-[#e7ecfb] bg-[linear-gradient(180deg,rgba(248,250,255,0.96)_0%,rgba(255,255,255,0.94)_100%)] p-6">
        <CardTitle className="text-xl leading-tight font-semibold text-[#101a2e]">
          {title}
        </CardTitle>
        {description ? <p className="text-sm leading-6 text-[#5b667b]">{description}</p> : null}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

export function StudentStatusCard({ title, description }: { title: string; description: string }) {
  return (
    <StudentSectionCard title={title}>
      <div className="flex min-h-28 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#f5f8ff_0%,#eef4ff_100%)] px-6 text-center">
        <p className="max-w-xl text-sm leading-7 text-[#5b667b]">{description}</p>
      </div>
    </StudentSectionCard>
  );
}

export function StudentMetricGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function StudentMetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#dce5fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-5 shadow-[0_10px_24px_rgba(19,27,46,0.04)]">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6980a8] uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0f1d37]">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-[#5b667b]">{hint}</p> : null}
    </div>
  );
}

export function StudentKeyValueList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-4 border-b border-[#edf1fb] pb-3 last:border-b-0 last:pb-0"
        >
          <span className="text-sm font-medium text-[#637187]">{item.label}</span>
          <span className="max-w-[60%] text-right text-sm font-semibold text-[#122039]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
