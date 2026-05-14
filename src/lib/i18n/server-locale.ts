import 'server-only';

import { cookies } from 'next/headers';

import { DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE_KEY, type AppLocale } from './config';

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;

  return locale && isAppLocale(locale) ? locale : DEFAULT_LOCALE;
}
