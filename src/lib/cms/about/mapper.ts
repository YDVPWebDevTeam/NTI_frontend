import { cmsText, mapFeatures } from '../marketing/shared';
import type { AboutContent, PayloadAbout } from './types';

/** Map the raw Payload `about` global into resolved content. */
export function mapPayloadAbout(payload: PayloadAbout): AboutContent {
  return {
    hero: {
      eyebrow: cmsText(payload.hero?.eyebrow),
      title: cmsText(payload.hero?.title),
      description: cmsText(payload.hero?.description),
    },
    what: {
      eyebrow: cmsText(payload.what?.eyebrow),
      title: cmsText(payload.what?.title),
      description: cmsText(payload.what?.description),
      features: mapFeatures(payload.what?.features),
    },
    values: {
      eyebrow: cmsText(payload.values?.eyebrow),
      title: cmsText(payload.values?.title),
      features: mapFeatures(payload.values?.features),
    },
    cta: {
      title: cmsText(payload.cta?.title),
      description: cmsText(payload.cta?.description),
    },
  };
}
