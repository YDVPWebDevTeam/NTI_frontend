import type { MarketingFeature } from 'components/marketing';

import type { RawFeature } from '../marketing/shared';

export type MentorCard = {
  name: string;
  role: string;
  bio: string;
  image: { url: string; alt: string };
};

/** Resolved, ready-to-render mentors content (editable copy only — CTAs/title live in code). */
export type MentorsContent = {
  hero: { eyebrow: string; title: string; description: string };
  value: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  people: { eyebrow: string; title: string; description: string; mentors: MentorCard[] };
  cta: { title: string; description: string };
};

type RawMedia = {
  alt?: string | null;
  url?: string | null;
};

/** Raw shape returned by the Payload `mentors` global. */
export type PayloadMentors = {
  hero?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
  } | null;
  value?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    features?: RawFeature[] | null;
  } | null;
  people?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    mentors?: Array<{
      name?: string | null;
      role?: string | null;
      bio?: string | null;
      image?: RawMedia | null;
    }> | null;
  } | null;
  cta?: {
    title?: string | null;
    description?: string | null;
  } | null;
};
