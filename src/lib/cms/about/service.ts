import 'server-only';

import type { AppLocale } from 'lib/i18n/config';

import { fetchGlobal } from '../marketing/shared';
import { mapPayloadAbout } from './mapper';
import type { AboutContent, PayloadAbout } from './types';

/**
 * Fetch about content from the CMS. Returns `null` when the CMS is not
 * configured / unreachable.
 */
export async function fetchAboutContent(locale: AppLocale): Promise<AboutContent | null> {
  const payload = await fetchGlobal<PayloadAbout>('about', locale);

  if (!payload) {
    return null;
  }

  return mapPayloadAbout(payload);
}
