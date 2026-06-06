import type { MarketingFeature } from 'components/marketing';

import type { RawFeature } from '../marketing/shared';

/** Resolved, ready-to-render about content (editable copy only — CTAs/title live in code). */
export type AboutContent = {
  hero: { eyebrow: string; title: string; description: string };
  what: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  values: { eyebrow: string; title: string; features: MarketingFeature[] };
  cta: { title: string; description: string };
};

/** Raw shape returned by the Payload `about` global. */
export type PayloadAbout = {
  hero?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
  } | null;
  what?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    features?: RawFeature[] | null;
  } | null;
  values?: {
    eyebrow?: string | null;
    title?: string | null;
    features?: RawFeature[] | null;
  } | null;
  cta?: {
    title?: string | null;
    description?: string | null;
  } | null;
};
