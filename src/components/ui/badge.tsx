import { cn } from '@/src/lib/utils';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'error';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-secondary text-secondary-foreground',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'error' && 'bg-red-100 text-red-800',
      )}
    >
      {label}
    </span>
  );
}
