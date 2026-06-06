import { cmsMediaUrl, cmsText, mapFeatures } from '../marketing/shared';
import type { MentorsContent, PayloadMentors } from './types';

/**
 * Default mentor portraits. Photos are static frontend assets (not editable
 * copy); a CMS media upload optionally overrides them per mentor, otherwise we
 * cycle through these defaults by index.
 */
const DEFAULT_MENTOR_IMAGES = [
  '/images/mentor-explaining.png',
  '/images/students-success.png',
  '/images/students-clients.png',
  '/images/students-working.png',
];

/** Map the raw Payload `mentors` global into resolved content. */
export function mapPayloadMentors(payload: PayloadMentors): MentorsContent {
  return {
    hero: {
      eyebrow: cmsText(payload.hero?.eyebrow),
      title: cmsText(payload.hero?.title),
      description: cmsText(payload.hero?.description),
    },
    value: {
      eyebrow: cmsText(payload.value?.eyebrow),
      title: cmsText(payload.value?.title),
      description: cmsText(payload.value?.description),
      features: mapFeatures(payload.value?.features),
    },
    people: {
      eyebrow: cmsText(payload.people?.eyebrow),
      title: cmsText(payload.people?.title),
      description: cmsText(payload.people?.description),
      mentors: (payload.people?.mentors ?? [])
        .map((mentor, index) => {
          const name = cmsText(mentor?.name);
          const uploadedUrl = cmsMediaUrl(mentor?.image?.url);

          return {
            name,
            role: cmsText(mentor?.role),
            bio: cmsText(mentor?.bio),
            image: {
              url: uploadedUrl || DEFAULT_MENTOR_IMAGES[index % DEFAULT_MENTOR_IMAGES.length],
              alt: cmsText(mentor?.image?.alt) || name,
            },
          };
        })
        .filter((mentor) => mentor.name),
    },
    cta: {
      title: cmsText(payload.cta?.title),
      description: cmsText(payload.cta?.description),
    },
  };
}
