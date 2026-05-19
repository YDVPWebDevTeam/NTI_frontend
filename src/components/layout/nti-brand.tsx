import Link from 'next/link';

import { cn } from 'lib/utils';

import { NtiLogo } from './nti-logo';

type NtiBrandProps = {
  href?: string;
  variant?: 'default' | 'light' | 'landing' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  ariaLabel?: string;
};

const SIZE_STYLES = {
  sm: {
    gap: 'gap-2.5',
    logo: 'h-8 w-8',
    wordmark: 'text-base tracking-[0.12em]',
  },
  md: {
    gap: 'gap-3',
    logo: 'h-10 w-10',
    wordmark: 'text-lg tracking-[0.14em]',
  },
  lg: {
    gap: 'gap-3.5',
    logo: 'h-12 w-12',
    wordmark: 'text-2xl tracking-[0.16em]',
  },
} as const;

const VARIANT_STYLES = {
  default: 'text-neutral-900 hover:text-neutral-700',
  light: 'text-white hover:text-white/85',
  landing: 'text-blue-900 hover:text-blue-800 dark:text-white dark:hover:text-white/85',
  admin: 'text-slate-50 hover:text-white',
} as const;

export function NtiBrand({
  href,
  variant = 'default',
  size = 'md',
  showWordmark = false,
  className,
  ariaLabel = 'NTI',
}: NtiBrandProps) {
  const content = (
    <>
      <NtiLogo className={SIZE_STYLES[size].logo} ariaLabel={ariaLabel} decorative={showWordmark} />
      {showWordmark ? (
        <span className={cn('font-semibold uppercase', SIZE_STYLES[size].wordmark)}>NTI</span>
      ) : null}
    </>
  );

  const classes = cn(
    'inline-flex items-center transition-colors',
    SIZE_STYLES[size].gap,
    VARIANT_STYLES[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <div className={classes} aria-label={showWordmark ? undefined : ariaLabel}>
      {content}
    </div>
  );
}
