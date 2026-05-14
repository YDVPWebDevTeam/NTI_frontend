'use client';

import { I18nProvider } from '@lingui/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  type AppLocale,
  DEFAULT_LOCALE,
  isAppLocale,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
} from 'lib/i18n/config';
import { activateLocale, i18n } from 'lib/i18n/runtime';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getStoredLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const localeCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${LOCALE_COOKIE_KEY}=`))
    ?.split('=')[1];

  if (localeCookie && isAppLocale(localeCookie)) {
    return localeCookie;
  }

  const locale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

  if (locale && isAppLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}

export function LinguiProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => getStoredLocale());
  const [activeLocale, setActiveLocale] = useState<AppLocale | null>(null);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      document.cookie = `${LOCALE_COOKIE_KEY}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = nextLocale;
    }

    setLocaleState(nextLocale);
    setActiveLocale((currentLocale) => (currentLocale === nextLocale ? currentLocale : null));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      await activateLocale(locale);

      if (cancelled) {
        return;
      }

      i18n.activate(locale);
      setActiveLocale(locale);
    };

    void setup();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  if (activeLocale !== locale) {
    return null;
  }

  return (
    <LocaleContext.Provider value={contextValue}>
      <I18nProvider key={activeLocale} i18n={i18n}>
        {children}
      </I18nProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within LinguiProvider');
  }

  return context;
}
