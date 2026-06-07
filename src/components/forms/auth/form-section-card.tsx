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
    <section className={cn('border-border bg-card rounded-xl border p-6 md:p-8', className)}>
      <div className={cn('mb-6', contentClassName)}>
        <h3 className="text-foreground text-xl font-semibold">{title}</h3>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
