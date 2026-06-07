import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'lib/utils';

/**
 * Single source of truth for status pills across the app.
 * Use a semantic `tone` instead of raw palette colors (slate/emerald/rose...).
 * All tones are driven by design tokens so they respond to theme/dark mode.
 */
export const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-muted text-muted-foreground',
        brand: 'border-primary/25 bg-accent text-primary',
        info: 'border-info/30 bg-info/10 text-info',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/35 bg-warning/10 text-warning',
        danger: 'border-destructive/30 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export type StatusBadgeTone = NonNullable<VariantProps<typeof statusBadgeVariants>['tone']>;

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
  /** Optional leading dot for quick visual scanning. */
  withDot?: boolean;
}

export function StatusBadge({
  className,
  tone,
  withDot = false,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)} {...props}>
      {withDot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}
