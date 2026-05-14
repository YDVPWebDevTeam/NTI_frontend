import 'server-only';

import type { AppLocale } from 'lib/i18n/config';

import { fallbackLandingPageContent } from './defaults';
import { mapPayloadLandingPage } from './mapper';
import type { LandingPageContent, PayloadLandingPage } from './types';

const DEFAULT_CMS_BASE_URL = 'http://localhost:3002';
const LANDING_PAGE_REVALIDATE_SECONDS = 300;

const CMS_BASE_URL = (
  process.env.NEXT_PUBLIC_CMS_URL ||
  (process.env.NODE_ENV === 'production' ? '' : DEFAULT_CMS_BASE_URL)
).replace(/\/+$/, '');

export async function fetchLandingPageContent(locale: AppLocale): Promise<LandingPageContent> {
  if (!CMS_BASE_URL) {
    return fallbackLandingPageContent[locale];
  }

  const url = new URL('/api/globals/landing-page', CMS_BASE_URL);

  url.searchParams.set('depth', '2');
  url.searchParams.set('draft', 'false');
  url.searchParams.set('locale', locale);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: LANDING_PAGE_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      return fallbackLandingPageContent[locale];
    }

    const payload = (await response.json()) as PayloadLandingPage;

    return mapPayloadLandingPage(payload, locale, CMS_BASE_URL);
  } catch {
    return fallbackLandingPageContent[locale];
  }
}
