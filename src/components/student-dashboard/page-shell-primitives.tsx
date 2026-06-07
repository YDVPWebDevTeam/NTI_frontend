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
      <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-primary text-[11px] font-semibold tracking-[0.24em] uppercase">
              {eyebrow}
            </p>
            <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-[15px]">
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
    <Card className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="border-border bg-card border-b p-6">
        <CardTitle className="text-foreground text-xl leading-tight font-semibold">
          {title}
        </CardTitle>
        {description ? (
          <p className="text-muted-foreground text-sm leading-6">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

export function StudentStatusCard({ title, description }: { title: string; description: string }) {
  return (
    <StudentSectionCard title={title}>
      <div className="bg-accent flex min-h-28 items-center justify-center rounded-2xl px-6 text-center">
        <p className="text-muted-foreground max-w-xl text-sm leading-7">{description}</p>
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
    <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="text-muted-foreground mt-2 text-sm leading-6">{hint}</p> : null}
    </div>
  );
}

export function StudentKeyValueList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="border-border flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
        >
          <span className="text-muted-foreground text-sm font-medium">{item.label}</span>
          <span className="text-foreground max-w-[60%] text-right text-sm font-semibold">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
