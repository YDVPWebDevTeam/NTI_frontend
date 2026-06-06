import 'server-only';

import type { MarketingFeature } from 'components/marketing';
import type { AppLocale } from 'lib/i18n/config';

import { CMS_BASE_URL, resolveCmsMediaUrl } from '../client';

/** How long (seconds) a fetched global stays fresh before ISR revalidation. */
const MARKETING_REVALIDATE_SECONDS = 300;

/**
 * Fetch a localized Payload global and return its raw JSON, or `null` when the
 * CMS is not configured / unreachable. Callers map the raw shape into their own
 * resolved content type — there is intentionally no hardcoded content fallback:
 * the CMS (seeded with defaults) is the single source of truth.
 */
export async function fetchGlobal<T>(slug: string, locale: AppLocale): Promise<T | null> {
  if (!CMS_BASE_URL) {
    return null;
  }

  const url = new URL(`/api/globals/${slug}`, CMS_BASE_URL);

  url.searchParams.set('depth', '2');
  url.searchParams.set('draft', 'false');
  url.searchParams.set('locale', locale);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: MARKETING_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Trim a possibly-null CMS string down to a plain string. */
export const cmsText = (value: string | null | undefined): string => value?.trim() ?? '';

/** Resolve a (possibly relative) CMS media URL to an absolute URL. */
export const cmsMediaUrl = resolveCmsMediaUrl;

export type RawFeature = {
  icon?: string | null;
  title?: string | null;
  description?: string | null;
};

export type RawLabel = {
  label?: string | null;
};

/** Map CMS feature rows into `MarketingFeature`s, dropping titleless entries. */
export function mapFeatures(raw: RawFeature[] | null | undefined): MarketingFeature[] {
  return (raw ?? [])
    .map((feature) => ({
      icon: cmsText(feature?.icon) || 'badge',
      title: cmsText(feature?.title),
      description: cmsText(feature?.description),
    }))
    .filter((feature) => feature.title);
}

/** Flatten a CMS `{ label }[]` array into a list of non-empty strings. */
export function mapLabels(raw: RawLabel[] | null | undefined): string[] {
  return (raw ?? []).map((entry) => cmsText(entry?.label)).filter(Boolean);
}
