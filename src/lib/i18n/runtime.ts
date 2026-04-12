import { i18n } from '@lingui/core';

import { DEFAULT_LOCALE, type AppLocale } from './config';

type CatalogModule = {
  messages: Record<string, string>;
  default?: {
    messages: Record<string, string>;
  };
};

const loaders: Record<AppLocale, () => Promise<CatalogModule>> = {
  en: () => import('@/src/locales/en/messages'),
  sk: () => import('@/src/locales/sk/messages'),
};

function ensureLocaleActivated() {
  if (i18n.locale) {
    return;
  }

  i18n.load(DEFAULT_LOCALE, {});
  i18n.activate(DEFAULT_LOCALE);
}

export async function activateLocale(locale: AppLocale) {
  const catalogModule = await loaders[locale]();
  const messages = catalogModule.messages ?? catalogModule.default?.messages ?? {};

  i18n.load(locale, messages);
}

export function activateDefaultLocale() {
  ensureLocaleActivated();
}

ensureLocaleActivated();

export { i18n };
