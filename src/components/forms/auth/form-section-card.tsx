import type { ReactNode } from 'react';

import { cn } from 'lib/utils';

type FormSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function FormSectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: FormSectionCardProps) {
  return (
    <section className={cn('rounded-xl border border-black/10 bg-white p-6 md:p-8', className)}>
      <div className={cn('mb-6', contentClassName)}>
        <h3 className="text-xl font-semibold text-[#0c1a4f]">{title}</h3>
        {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
