'use client';

import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/shadcn/button';
import { type AppLocale } from '@/src/lib/i18n/config';
import { useLocale } from '@/src/components/providers/i18n-provider';

const LANGUAGES: Array<{ value: AppLocale; label: string }> = [
  { value: 'sk', label: 'SK' },
  { value: 'en', label: 'EN' },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-black/10 bg-white/95 p-1 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      {LANGUAGES.map((language) => (
        <Button
          key={language.value}
          type="button"
          variant={locale === language.value ? 'default' : 'ghost'}
          className="h-8 min-w-10 px-2 text-xs font-semibold"
          onClick={() => setLocale(language.value)}
        >
          {language.label}
        </Button>
      ))}
    </div>
  );
}
