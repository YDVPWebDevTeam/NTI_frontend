import 'server-only';

const DEFAULT_CMS_BASE_URL = 'http://localhost:3002';

/**
 * Base URL of the Payload CMS. Empty string means "no CMS configured" — callers
 * should fall back to their built-in static content in that case.
 */
export const CMS_BASE_URL = (
  process.env.NEXT_PUBLIC_CMS_URL ||
  (process.env.NODE_ENV === 'production' ? '' : DEFAULT_CMS_BASE_URL)
).replace(/\/+$/, '');

/** Resolve a (possibly relative) CMS media URL to an absolute URL. */
export function resolveCmsMediaUrl(url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (!CMS_BASE_URL) {
    return url;
  }

  return `${CMS_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}
