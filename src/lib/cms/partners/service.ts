import 'server-only';

import type { AppLocale } from 'lib/i18n/config';

import { fetchGlobal } from '../marketing/shared';
import { mapPayloadPartners } from './mapper';
import type { PartnersContent, PayloadPartners } from './types';

/**
 * Fetch partners content from the CMS. Returns `null` when the CMS is not
 * configured / unreachable — the page treats that as "not found" rather than
 * substituting hardcoded copy.
 */
export async function fetchPartnersContent(locale: AppLocale): Promise<PartnersContent | null> {
  const payload = await fetchGlobal<PayloadPartners>('partners', locale);

  if (!payload) {
    return null;
  }

  return mapPayloadPartners(payload);
}
