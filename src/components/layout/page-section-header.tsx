import type { ReactNode } from 'react';

import { cn } from 'lib/utils';

type PageSectionHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  bordered?: boolean;
  theme?: 'default' | 'admin' | 'inverse';
};

const THEME_STYLES = {
  default: {
    eyebrow: 'text-muted-foreground',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    border: 'border-border',
  },
  admin: {
    eyebrow: 'text-muted-foreground',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    border: 'border-border',
  },
  inverse: {
    eyebrow: 'text-white/60',
    title: 'text-white',
    description: 'text-white/70',
    border: 'border-white/10',
  },
} as const;

export function PageSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  bordered = false,
  theme = 'default',
}: PageSectionHeaderProps) {
  const styles = THEME_STYLES[theme];

  return (
    <div className={cn(className, bordered && 'mb-7 border-b pb-6', bordered && styles.border)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <p
              className={cn(
                'text-[11px] font-medium tracking-[0.12em] uppercase',
                styles.eyebrow,
                eyebrowClassName,
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={cn(
              'mt-2 text-4xl font-semibold tracking-tight',
              styles.title,
              titleClassName,
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                'mt-3 max-w-170 text-[15px] leading-relaxed',
                styles.description,
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="sm:pt-1">{actions}</div> : null}
      </div>
    </div>
  );
}
