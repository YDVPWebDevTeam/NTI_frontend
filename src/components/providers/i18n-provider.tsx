'use client';

import { I18nProvider } from '@lingui/react';
import type { Messages } from '@lingui/core';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { type AppLocale, LOCALE_COOKIE_KEY, LOCALE_STORAGE_KEY } from 'lib/i18n/config';
import { activateLocale, i18n } from 'lib/i18n/runtime';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LinguiProviderProps = {
  children: React.ReactNode;
  /** Locale resolved on the server from the request cookie. */
  initialLocale: AppLocale;
  /** Compiled catalog for {@link initialLocale}, loaded on the server. */
  initialMessages: Messages;
};

export function LinguiProvider({ children, initialLocale, initialMessages }: LinguiProviderProps) {
  // Activate the singleton synchronously on the very first render (server + client
  // hydration) so content is never gated behind an async catalog load. Without this
  // the whole app would render `null` until a client effect resolves, producing a
  // blank first paint and no SSR HTML.
  useState(() => {
    i18n.load(initialLocale, initialMessages);
    i18n.activate(initialLocale);

    return true;
  });

  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [activeLocale, setActiveLocale] = useState<AppLocale>(initialLocale);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      document.cookie = `${LOCALE_COOKIE_KEY}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = nextLocale;
    }

    setLocaleState(nextLocale);
  }, []);

  useEffect(() => {
    // Initial locale is already loaded + activated synchronously above.
    if (locale === activeLocale) {
      return;
    }

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
  }, [locale, activeLocale]);

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

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
