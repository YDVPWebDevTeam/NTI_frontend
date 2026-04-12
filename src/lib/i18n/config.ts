export const SUPPORTED_LOCALES = ['en', 'sk'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'sk';

export const LOCALE_STORAGE_KEY = 'app-locale';

export function isAppLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}
