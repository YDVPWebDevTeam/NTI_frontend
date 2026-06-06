import 'server-only';

import type { AppLocale } from 'lib/i18n/config';

import { CMS_BASE_URL } from '../client';

import { mapPayloadNewsDoc } from './mapper';
import type { NewsArticle, PayloadNewsListResponse } from './types';

const NEWS_REVALIDATE_SECONDS = 300;

function sortByPublishedAtDesc(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;

    return bTime - aTime;
  });
}

async function fetchNewsDocs(
  locale: AppLocale,
  params: Record<string, string>,
): Promise<NewsArticle[]> {
  if (!CMS_BASE_URL) {
    return [];
  }

  const url = new URL('/api/news', CMS_BASE_URL);

  url.searchParams.set('depth', '1');
  url.searchParams.set('locale', locale);
  url.searchParams.set('where[status][equals]', 'published');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: NEWS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as PayloadNewsListResponse;

    return (payload.docs ?? [])
      .map(mapPayloadNewsDoc)
      .filter((article): article is NewsArticle => Boolean(article));
  } catch {
    return [];
  }
}

/** List published articles, newest first. Empty when the CMS has none. */
export async function fetchNewsList(locale: AppLocale): Promise<NewsArticle[]> {
  const articles = await fetchNewsDocs(locale, {
    sort: '-publishedAt',
    limit: '24',
  });

  return sortByPublishedAtDesc(articles);
}

/** Fetch a single published article by slug, or null if not found. */
export async function fetchNewsArticle(
  slug: string,
  locale: AppLocale,
): Promise<NewsArticle | null> {
  const articles = await fetchNewsDocs(locale, {
    'where[slug][equals]': slug,
    limit: '1',
  });

  return articles[0] ?? null;
}

/** Fetch the most recently published article, or null if none exist. */
export async function fetchLatestNewsArticle(locale: AppLocale): Promise<NewsArticle | null> {
  const articles = await fetchNewsDocs(locale, {
    sort: '-publishedAt',
    limit: '1',
  });

  return articles[0] ?? null;
}
