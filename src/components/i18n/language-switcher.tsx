'use client';

import { Languages } from 'lucide-react';

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
  const { locale, setLocale } = useLocale();
  const currentLanguage = LANGUAGES.find((language) => language.value === locale) ?? LANGUAGES[0];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-black/5 bg-white p-0.5 shadow-sm transition-all hover:shadow-md',
        className,
      )}
    >
      <Select value={locale} onValueChange={(nextLocale) => setLocale(nextLocale as AppLocale)}>
        <SelectTrigger
          aria-label="Change language"
          className={cn(
            'h-8 w-auto min-w-25 rounded-full border-none bg-transparent px-3 text-sm shadow-none transition-colors hover:bg-slate-100 focus:ring-0 focus:ring-offset-0',
            triggerClassName,
          )}
        >
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 shrink-0 text-slate-600" />
            <span className="hidden text-[10px] font-semibold tracking-wider text-slate-500 uppercase sm:inline">
              Language
            </span>
            <span className="font-medium text-slate-800">{currentLanguage.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent
          align="end"
          className={cn(
            'min-w-35 overflow-hidden rounded-xl border border-slate-200/60 bg-white p-1 shadow-lg',
            contentClassName,
          )}
        >
          {LANGUAGES.map((language) => (
            <SelectItem
              key={language.value}
              value={language.value}
              className="cursor-pointer rounded-lg py-2 pr-3 pl-9 text-sm font-medium transition-all data-highlighted:bg-slate-100 data-[state=checked]:bg-slate-50 data-[state=checked]:text-slate-900"
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
