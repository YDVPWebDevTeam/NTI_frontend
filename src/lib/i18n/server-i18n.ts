import 'server-only';

import { setupI18n, type I18n, type Messages } from '@lingui/core';

import type { AppLocale } from './config';

type CatalogModule = {
  messages?: Messages;
  default?: {
    messages?: Messages;
  };
};

const catalogLoaders: Record<AppLocale, () => Promise<CatalogModule>> = {
  en: () => import('locales/en/messages'),
  sk: () => import('locales/sk/messages'),
};

export async function getServerI18n(locale: AppLocale): Promise<I18n> {
  const catalogModule = await catalogLoaders[locale]();

  const messages = catalogModule.messages ?? catalogModule.default?.messages ?? {};

  return setupI18n({
    locale,
    messages: {
      [locale]: messages,
    },
  });
}
