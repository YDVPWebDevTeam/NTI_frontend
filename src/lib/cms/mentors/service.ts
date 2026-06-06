import 'server-only';

import type { AppLocale } from 'lib/i18n/config';

import { fetchGlobal } from '../marketing/shared';
import { mapPayloadMentors } from './mapper';
import type { MentorsContent, PayloadMentors } from './types';

/**
 * Fetch mentors content from the CMS. Returns `null` when the CMS is not
 * configured / unreachable.
 */
export async function fetchMentorsContent(locale: AppLocale): Promise<MentorsContent | null> {
  const payload = await fetchGlobal<PayloadMentors>('mentors', locale);

  if (!payload) {
    return null;
  }

  return mapPayloadMentors(payload);
}
