import type { AppLocale } from 'lib/i18n/config';

import { fallbackLandingPageContent } from './defaults';
import type {
  CmsImage,
  CmsLink,
  LandingPageContent,
  PayloadLandingPage,
  PayloadLocalizedLink,
  PayloadMedia,
} from './types';

function resolveLink(link: PayloadLocalizedLink | null | undefined, fallback: CmsLink): CmsLink {
  return {
    href: link?.href?.trim() || fallback.href,
    label: link?.label?.trim() || fallback.label,
  };
}

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

function resolveImage(
  cmsBaseUrl: string,
  media: PayloadMedia | null | undefined,
  fallback: CmsImage,
): CmsImage {
  const url = resolveMediaUrl(cmsBaseUrl, media?.url);

  return {
    alt: media?.alt?.trim() || fallback.alt,
    url: url || fallback.url,
  };
}

export function mapPayloadLandingPage(
  payload: PayloadLandingPage,
  locale: AppLocale,
  cmsBaseUrl: string,
): LandingPageContent {
  const fallback = fallbackLandingPageContent[locale];

  return {
    ecosystem: {
      description: payload.ecosystem?.description?.trim() || fallback.ecosystem.description,
      heading: payload.ecosystem?.heading?.trim() || fallback.ecosystem.heading,
      mentors:
        payload.ecosystem?.mentors
          ?.map((mentor, index) => {
            const mentorFallback =
              fallback.ecosystem.mentors[index] || fallback.ecosystem.mentors.at(-1);

            if (!mentorFallback) {
              return null;
            }

            return {
              bio: mentor?.bio?.trim() || mentorFallback.bio,
              image: resolveImage(cmsBaseUrl, mentor?.image, mentorFallback.image),
              name: mentor?.name?.trim() || mentorFallback.name,
              role: mentor?.role?.trim() || mentorFallback.role,
            };
          })
          .filter((mentor): mentor is LandingPageContent['ecosystem']['mentors'][number] =>
            Boolean(mentor),
          ) || fallback.ecosystem.mentors,
      partnerLogos:
        payload.ecosystem?.partnerLogos
          ?.map((partner) => partner?.label?.trim())
          .filter((partner): partner is string => Boolean(partner)) ||
        fallback.ecosystem.partnerLogos,
      successHighlight: {
        eyebrow:
          payload.ecosystem?.successHighlight?.eyebrow?.trim() ||
          fallback.ecosystem.successHighlight.eyebrow,
        metric:
          payload.ecosystem?.successHighlight?.metric?.trim() ||
          fallback.ecosystem.successHighlight.metric,
        subtext:
          payload.ecosystem?.successHighlight?.subtext?.trim() ||
          fallback.ecosystem.successHighlight.subtext,
        title:
          payload.ecosystem?.successHighlight?.title?.trim() ||
          fallback.ecosystem.successHighlight.title,
      },
    },
    finalCTA: {
      description: payload.finalCTA?.description?.trim() || fallback.finalCTA.description,
      primaryCTA: resolveLink(payload.finalCTA?.primaryCTA, fallback.finalCTA.primaryCTA),
      secondaryCTA: resolveLink(payload.finalCTA?.secondaryCTA, fallback.finalCTA.secondaryCTA),
      title: payload.finalCTA?.title?.trim() || fallback.finalCTA.title,
    },
    hero: {
      description: payload.hero?.description?.trim() || fallback.hero.description,
      eyebrow: payload.hero?.eyebrow?.trim() || fallback.hero.eyebrow,
      heroImage: resolveImage(cmsBaseUrl, payload.hero?.heroImage, fallback.hero.heroImage),
      learnMoreCTA: resolveLink(payload.hero?.learnMoreCTA, fallback.hero.learnMoreCTA),
      primaryCTA: resolveLink(payload.hero?.primaryCTA, fallback.hero.primaryCTA),
      secondaryCTA: resolveLink(payload.hero?.secondaryCTA, fallback.hero.secondaryCTA),
      titleHighlight: payload.hero?.titleHighlight?.trim() || fallback.hero.titleHighlight,
      titlePrefix: payload.hero?.titlePrefix?.trim() || fallback.hero.titlePrefix,
      titleSuffix: payload.hero?.titleSuffix?.trim() || fallback.hero.titleSuffix,
    },
    infrastructure: {
      cards:
        payload.infrastructure?.cards
          ?.map((card, index) => {
            const cardFallback =
              fallback.infrastructure.cards[index] || fallback.infrastructure.cards.at(-1);

            if (!cardFallback) {
              return null;
            }

            return {
              description: card?.description?.trim() || cardFallback.description,
              icon: card?.icon || cardFallback.icon,
              title: card?.title?.trim() || cardFallback.title,
              tone: card?.tone || cardFallback.tone,
            };
          })
          .filter((card): card is LandingPageContent['infrastructure']['cards'][number] =>
            Boolean(card),
          ) || fallback.infrastructure.cards,
      eyebrow: payload.infrastructure?.eyebrow?.trim() || fallback.infrastructure.eyebrow,
      featuredCard: {
        description:
          payload.infrastructure?.featuredCard?.description?.trim() ||
          fallback.infrastructure.featuredCard.description,
        icon:
          payload.infrastructure?.featuredCard?.icon || fallback.infrastructure.featuredCard.icon,
        image: resolveImage(
          cmsBaseUrl,
          payload.infrastructure?.featuredCard?.image,
          fallback.infrastructure.featuredCard.image,
        ),
        title:
          payload.infrastructure?.featuredCard?.title?.trim() ||
          fallback.infrastructure.featuredCard.title,
      },
      heading: payload.infrastructure?.heading?.trim() || fallback.infrastructure.heading,
    },
    programs: {
      heading: payload.programs?.heading?.trim() || fallback.programs.heading,
      items:
        payload.programs?.items
          ?.map((program, index) => {
            const programFallback =
              fallback.programs.items[index] || fallback.programs.items.at(-1);

            if (!programFallback) {
              return null;
            }

            return {
              accent: program?.accent || programFallback.accent,
              bulletItems:
                program?.bulletItems
                  ?.map((bullet) => bullet?.label?.trim())
                  .filter((bullet): bullet is string => Boolean(bullet)) ||
                programFallback.bulletItems,
              cta: resolveLink(program?.cta, programFallback.cta),
              description: program?.description?.trim() || programFallback.description,
              icon: program?.icon || programFallback.icon,
              title: program?.title?.trim() || programFallback.title,
            };
          })
          .filter((program): program is LandingPageContent['programs']['items'][number] =>
            Boolean(program),
          ) || fallback.programs.items,
    },
  };
}
