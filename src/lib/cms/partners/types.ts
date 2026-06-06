import type { MarketingFeature } from 'components/marketing';

import type { RawFeature, RawLabel } from '../marketing/shared';

/** Resolved, ready-to-render partners content (editable copy only — CTAs/title live in code). */
export type PartnersContent = {
  hero: { eyebrow: string; title: string; description: string };
  why: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  ways: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  logos: { label: string; items: string[] };
  cta: { title: string; description: string };
};

/** Raw shape returned by the Payload `partners` global. */
export type PayloadPartners = {
  hero?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
  } | null;
  why?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    features?: RawFeature[] | null;
  } | null;
  ways?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    features?: RawFeature[] | null;
  } | null;
  logos?: {
    label?: string | null;
    items?: RawLabel[] | null;
  } | null;
  cta?: {
    title?: string | null;
    description?: string | null;
  } | null;
};
