import 'server-only';

import type { AppLocale } from 'lib/i18n/config';

import { CMS_BASE_URL } from '../client';
import { mapPayloadLandingPage } from './mapper';
import type { LandingPageContent, PayloadLandingPage } from './types';

const LANDING_PAGE_REVALIDATE_SECONDS = 300;

/**
 * Fetch landing-page content from the CMS. The CMS (seeded with defaults) is the
 * single source of truth for all copy — when it is unconfigured or unreachable
 * we map an empty payload, which yields empty text plus the bundled default
 * image assets rather than a hardcoded content duplicate.
 */
export async function fetchLandingPageContent(locale: AppLocale): Promise<LandingPageContent> {
  if (!CMS_BASE_URL) {
    return mapPayloadLandingPage({}, CMS_BASE_URL);
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
      return mapPayloadLandingPage({}, CMS_BASE_URL);
    }

    const payload = (await response.json()) as PayloadLandingPage;

    return mapPayloadLandingPage(payload, CMS_BASE_URL);
  } catch {
    return mapPayloadLandingPage({}, CMS_BASE_URL);
  }
}
