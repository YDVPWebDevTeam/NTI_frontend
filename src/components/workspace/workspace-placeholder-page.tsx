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
    <section className="rounded-[1.75rem] border border-[#dfe7fa] bg-white/90 p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-semibold tracking-[0.18em] text-[#1e58d5] uppercase">
        {t`Workspace`}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#10213d]">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#60718d]">{description}</p>
    </section>
  );
}
