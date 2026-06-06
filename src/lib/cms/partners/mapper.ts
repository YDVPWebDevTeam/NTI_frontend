import { cmsText, mapFeatures, mapLabels } from '../marketing/shared';
import type { PartnersContent, PayloadPartners } from './types';

/** Map the raw Payload `partners` global into resolved content. */
export function mapPayloadPartners(payload: PayloadPartners): PartnersContent {
  return {
    hero: {
      eyebrow: cmsText(payload.hero?.eyebrow),
      title: cmsText(payload.hero?.title),
      description: cmsText(payload.hero?.description),
    },
    why: {
      eyebrow: cmsText(payload.why?.eyebrow),
      title: cmsText(payload.why?.title),
      description: cmsText(payload.why?.description),
      features: mapFeatures(payload.why?.features),
    },
    ways: {
      eyebrow: cmsText(payload.ways?.eyebrow),
      title: cmsText(payload.ways?.title),
      description: cmsText(payload.ways?.description),
      features: mapFeatures(payload.ways?.features),
    },
    logos: {
      label: cmsText(payload.logos?.label),
      items: mapLabels(payload.logos?.items),
    },
    cta: {
      title: cmsText(payload.cta?.title),
      description: cmsText(payload.cta?.description),
    },
  };
}
