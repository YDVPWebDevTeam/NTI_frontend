import {
  LANDING_FEATURED_IMAGE_URL,
  LANDING_HERO_IMAGE_URL,
  LANDING_MENTOR_IMAGE_URLS,
} from './defaults';
import type { CmsImage, LandingPageContent, PayloadLandingPage, PayloadMedia } from './types';

const trim = (value: string | null | undefined): string => value?.trim() ?? '';

function resolveMediaUrl(cmsBaseUrl: string, url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (!cmsBaseUrl) {
    return url;
  }

  return `${cmsBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

/** Resolve a CMS image, falling back to a default *asset* URL (not copy). */
function resolveImage(
  cmsBaseUrl: string,
  media: PayloadMedia | null | undefined,
  defaultUrl: string,
): CmsImage {
  return {
    alt: trim(media?.alt),
    url: resolveMediaUrl(cmsBaseUrl, media?.url) || defaultUrl,
  };
}

/**
 * Map the raw Payload `landing-page` global into resolved content. Text fields
 * coalesce to empty strings (the CMS seed is the source of truth); only image
 * assets fall back to bundled defaults.
 */
export function mapPayloadLandingPage(
  payload: PayloadLandingPage,
  cmsBaseUrl: string,
): LandingPageContent {
  return {
    ecosystem: {
      description: trim(payload.ecosystem?.description),
      heading: trim(payload.ecosystem?.heading),
      mentors: (payload.ecosystem?.mentors ?? []).map((mentor, index) => ({
        bio: trim(mentor?.bio),
        image: resolveImage(
          cmsBaseUrl,
          mentor?.image,
          LANDING_MENTOR_IMAGE_URLS[index % LANDING_MENTOR_IMAGE_URLS.length],
        ),
        name: trim(mentor?.name),
        role: trim(mentor?.role),
      })),
      partnerLogos: (payload.ecosystem?.partnerLogos ?? [])
        .map((partner) => trim(partner?.label))
        .filter(Boolean),
      successHighlight: {
        eyebrow: trim(payload.ecosystem?.successHighlight?.eyebrow),
        metric: trim(payload.ecosystem?.successHighlight?.metric),
        subtext: trim(payload.ecosystem?.successHighlight?.subtext),
        title: trim(payload.ecosystem?.successHighlight?.title),
      },
    },
    finalCTA: {
      description: trim(payload.finalCTA?.description),
      title: trim(payload.finalCTA?.title),
    },
    hero: {
      description: trim(payload.hero?.description),
      eyebrow: trim(payload.hero?.eyebrow),
      heroImage: resolveImage(cmsBaseUrl, payload.hero?.heroImage, LANDING_HERO_IMAGE_URL),
      titleHighlight: trim(payload.hero?.titleHighlight),
      titlePrefix: trim(payload.hero?.titlePrefix),
      titleSuffix: trim(payload.hero?.titleSuffix),
    },
    infrastructure: {
      cards: (payload.infrastructure?.cards ?? []).map((card) => ({
        description: trim(card?.description),
        icon: card?.icon ?? 'rocket',
        title: trim(card?.title),
        tone: card?.tone ?? 'surface',
      })),
      eyebrow: trim(payload.infrastructure?.eyebrow),
      featuredCard: {
        description: trim(payload.infrastructure?.featuredCard?.description),
        icon: payload.infrastructure?.featuredCard?.icon ?? 'rocket',
        image: resolveImage(
          cmsBaseUrl,
          payload.infrastructure?.featuredCard?.image,
          LANDING_FEATURED_IMAGE_URL,
        ),
        title: trim(payload.infrastructure?.featuredCard?.title),
      },
      heading: trim(payload.infrastructure?.heading),
    },
    programs: {
      heading: trim(payload.programs?.heading),
      items: (payload.programs?.items ?? []).map((program) => ({
        accent: program?.accent ?? 'primary',
        bulletItems: (program?.bulletItems ?? [])
          .map((bullet) => trim(bullet?.label))
          .filter(Boolean),
        description: trim(program?.description),
        icon: program?.icon ?? 'rocket',
        title: trim(program?.title),
      })),
    },
  };
}
