'use client';

import { t } from '@lingui/core/macro';
import { Languages } from 'lucide-react';
import { startTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger } from 'components/shadcn';
import { cn } from 'lib/utils';
import { type AppLocale } from 'lib/i18n/config';
import { useLocale } from 'components/providers';

const LANGUAGES: Array<{ value: AppLocale; label: string }> = [
  { value: 'sk', label: 'Slovenčina' },
  { value: 'en', label: 'English' },
];

type LanguageSelectorProps = {
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function LanguageSelector({
  className,
  triggerClassName,
  contentClassName,
}: LanguageSelectorProps) {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const currentLanguage = LANGUAGES.find((language) => language.value === locale) ?? LANGUAGES[0];

  function handleLocaleChange(nextLocale: string) {
    setLocale(nextLocale as AppLocale);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        'border-border bg-card inline-flex items-center rounded-full border p-0.5 shadow-sm transition-all hover:shadow-md',
        className,
      )}
    >
      <Select value={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger
          aria-label={t`Change language`}
          className={cn(
            'hover:bg-muted h-8 w-auto min-w-25 rounded-full border-none bg-transparent px-3 text-sm shadow-none transition-colors focus:ring-0 focus:ring-offset-0',
            triggerClassName,
          )}
        >
          <div className="flex items-center gap-2 text-inherit">
            <Languages className="h-4 w-4 shrink-0" />
            <span className="font-medium">{currentLanguage.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent
          align="end"
          className={cn(
            'border-border bg-card min-w-35 overflow-hidden rounded-xl border p-1 shadow-lg',
            contentClassName,
          )}
        >
          {LANGUAGES.map((language) => (
            <SelectItem
              key={language.value}
              value={language.value}
              className="data-highlighted:bg-muted data-[state=checked]:bg-accent data-[state=checked]:text-foreground cursor-pointer rounded-lg py-2 pr-3 pl-9 text-sm font-medium transition-all"
            >
              {language.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const LanguageSwitcher = LanguageSelector;
