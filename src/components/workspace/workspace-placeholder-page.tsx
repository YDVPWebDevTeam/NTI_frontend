'use client';

import { t } from '@lingui/core/macro';

type WorkspacePlaceholderPageProps = {
  description?: string;
  title: string;
};

export function WorkspacePlaceholderPage({
  description = t`This workspace is correctly routed, but its feature surface is not implemented yet.`,
  title,
}: WorkspacePlaceholderPageProps) {
  return (
    <section className="border-border bg-card rounded-2xl border p-8 shadow-sm">
      <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
        {t`Workspace`}
      </p>
      <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7">{description}</p>
    </section>
  );
}
