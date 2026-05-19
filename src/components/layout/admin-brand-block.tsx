import type { ReactNode } from 'react';

import { cn } from 'lib/utils';

import { NtiBrand } from './nti-brand';

type AdminBrandBlockProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  compact?: boolean;
};

export function AdminBrandBlock({
  eyebrow,
  title,
  description,
  className,
  compact = false,
}: AdminBrandBlockProps) {
  return (
    <div className={cn(className)}>
      <NtiBrand variant="admin" size={compact ? 'sm' : 'md'} />
      <p className="mt-6 text-[11px] font-medium tracking-[0.16em] text-sky-200/70 uppercase">
        {eyebrow}
      </p>
      <h1
        className={cn(
          'mt-3 font-semibold tracking-tight text-white',
          compact ? 'text-2xl' : 'text-4xl',
        )}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">{description}</p>
      ) : null}
    </div>
  );
}
