import { resolveCmsMediaUrl } from '../client';

import type { NewsArticle, NewsImage, PayloadNewsDoc } from './types';

function resolveCover(cover: PayloadNewsDoc['coverImage']): NewsImage | null {
  if (!cover || typeof cover === 'string') {
    return null;
  }

  const url = resolveCmsMediaUrl(cover.url);

  if (!url) {
    return null;
  }

  return {
    alt: cover.alt?.trim() || '',
    url,
  };
}

/** Map a raw Payload news document into the frontend article shape. */
export function mapPayloadNewsDoc(doc: PayloadNewsDoc): NewsArticle | null {
  const slug = doc.slug?.trim();
  const title = doc.title?.trim();

  if (!slug || !title) {
    return null;
  }

  return {
    slug,
    title,
    excerpt: doc.excerpt?.trim() || '',
    category: doc.category?.trim() || null,
    author: doc.author?.trim() || null,
    publishedAt: doc.publishedAt || null,
    coverImage: resolveCover(doc.coverImage),
    body: doc.content ?? null,
  };
}
