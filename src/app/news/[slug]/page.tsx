import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Newspaper } from 'lucide-react';

import { LandingFooter, LandingHeader } from 'components/layout';
import { fetchNewsArticle, NewsArticleBody, newsPageCopy } from 'lib/cms/news';
import { ROUTES } from 'lib/constants';
import { type AppLocale } from 'lib/i18n/config';
import { getRequestLocale } from 'lib/i18n/server-locale';

// Note: data is cached/revalidated at the fetch layer (see news service). We do
// NOT set a route-level `revalidate` here so that notFound() returns a real 404
// status instead of a soft-200 ISR-cached not-found page.

type NewsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(iso: string | null, locale: AppLocale): string | null {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === 'sk' ? 'sk-SK' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const article = await fetchNewsArticle(slug, locale);

  // Trigger the 404 here (before any body streaming) so the response carries a
  // real 404 status rather than a soft-200 not-found page.
  if (!article) {
    notFound();
  }

  return {
    title: `${article.title} — NTI`,
    description: article.excerpt || undefined,
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const article = await fetchNewsArticle(slug, locale);

  if (!article) {
    notFound();
  }

  const copy = newsPageCopy[locale];
  const date = formatDate(article.publishedAt, locale);

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen overflow-x-hidden antialiased">
      <LandingHeader />

      <article className="pt-28 pb-20 md:pt-36">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href={ROUTES.NEWS}
            className="text-on-surface-variant hover:text-primary group mb-8 inline-flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {copy.backToNews}
          </Link>

          <div className="space-y-4">
            {article.category ? (
              <span className="text-tertiary text-xs font-bold tracking-widest uppercase">
                {article.category}
              </span>
            ) : null}
            <h1 className="font-headline text-on-surface text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="text-on-surface-variant/70 text-sm font-medium">
              {date}
              {date && article.author ? ' · ' : ''}
              {article.author ? `${copy.by} ${article.author}` : ''}
            </p>
          </div>

          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5">
            {article.coverImage ? (
              <Image
                fill
                alt={article.coverImage.alt || article.title}
                className="object-cover"
                src={article.coverImage.url}
                unoptimized
                priority
              />
            ) : (
              <div className="from-primary to-primary-container flex h-full w-full items-center justify-center bg-gradient-to-br">
                <Newspaper className="h-14 w-14 text-white/40" />
              </div>
            )}
          </div>

          {article.excerpt ? (
            <p className="text-on-surface mt-10 text-xl leading-relaxed font-medium">
              {article.excerpt}
            </p>
          ) : null}

          <div className="mt-8">
            <NewsArticleBody body={article.body} />
          </div>

          <div className="border-outline-variant/30 mt-14 border-t pt-8">
            <Link
              href={ROUTES.NEWS}
              className="text-primary group inline-flex items-center gap-2 font-bold"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {copy.backToNews}
            </Link>
          </div>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
