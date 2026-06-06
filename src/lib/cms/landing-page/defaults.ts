/**
 * Default image *assets* for the landing page. These are static files in
 * `/public` — not editable copy — so they live in code, not the CMS. A CMS
 * media upload optionally overrides them; all text comes solely from the CMS.
 * There is intentionally no hardcoded content fallback.
 */

export const LANDING_HERO_IMAGE_URL = '/images/students.png';
export const LANDING_FEATURED_IMAGE_URL = '/images/students-working.png';

/** Default mentor portraits, cycled by index when no CMS upload is present. */
export const LANDING_MENTOR_IMAGE_URLS = [
  '/images/students-clients.png',
  '/images/students-success.png',
];
