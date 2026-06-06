import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';

import { Reveal } from 'components/landing';
import { fetchNewsList, newsPageCopy, type NewsArticle } from 'lib/cms/news';
import { ROUTES } from 'lib/constants';
import { type AppLocale } from 'lib/i18n/config';
import { getRequestLocale } from 'lib/i18n/server-locale';

export const revalidate = 300;

const STAGGER_MS = 90;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = newsPageCopy[locale];

  return {
    title: `${copy.heading} — NTI`,
    description: copy.subheading,
  };
}

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

function CoverImage({ article }: { article: NewsArticle }) {
  if (article.coverImage) {
    return (
      <Image
        fill
        alt={article.coverImage.alt || article.title}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        src={article.coverImage.url}
        unoptimized
      />
    );
  }

  return (
    <div className="from-primary to-primary-container flex h-full w-full items-center justify-center bg-gradient-to-br">
      <Newspaper className="h-12 w-12 text-white/40" />
    </div>
  );
}

function CategoryChip({ label }: { label: string }) {
  return (
    <span className="bg-surface-container-lowest/90 text-primary absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase backdrop-blur">
      {label}
    </span>
  );
}

function ArticleMeta({
  article,
  copy,
  locale,
}: {
  article: NewsArticle;
  copy: (typeof newsPageCopy)[AppLocale];
  locale: AppLocale;
}) {
  const date = formatDate(article.publishedAt, locale);

  return (
    <p className="text-on-surface-variant/70 text-xs font-medium tracking-wide">
      {date}
      {date && article.author ? ' · ' : ''}
      {article.author ? `${copy.by} ${article.author}` : ''}
    </p>
  );
}

function FeaturedCard({
  article,
  copy,
  locale,
}: {
  article: NewsArticle;
  copy: (typeof newsPageCopy)[AppLocale];
  locale: AppLocale;
}) {
  return (
    <Link
      href={ROUTES.newsArticle(article.slug)}
      className="group bg-surface-container-lowest hover:shadow-primary/10 grid overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
        <CoverImage article={article} />
        {article.category ? <CategoryChip label={article.category} /> : null}
      </div>
      <div className="flex flex-col justify-center gap-4 p-8 lg:p-12">
        <span className="text-tertiary text-xs font-bold tracking-widest uppercase">
          {copy.latest}
        </span>
        <h2 className="font-headline text-on-surface text-3xl leading-tight font-extrabold">
          {article.title}
        </h2>
        <ArticleMeta article={article} copy={copy} locale={locale} />
        <p className="text-on-surface-variant leading-relaxed">{article.excerpt}</p>
        <span className="text-primary inline-flex items-center gap-2 font-bold">
          {copy.readMore}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function NewsCard({
  article,
  copy,
  locale,
}: {
  article: NewsArticle;
  copy: (typeof newsPageCopy)[AppLocale];
  locale: AppLocale;
}) {
  return (
    <Link
      href={ROUTES.newsArticle(article.slug)}
      className="group bg-surface-container-lowest hover:shadow-primary/10 flex h-full flex-col overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CoverImage article={article} />
        {article.category ? <CategoryChip label={article.category} /> : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <ArticleMeta article={article} copy={copy} locale={locale} />
        <h3 className="font-headline text-on-surface text-xl font-bold">{article.title}</h3>
        <p className="text-on-surface-variant line-clamp-3 text-sm leading-relaxed">
          {article.excerpt}
        </p>
        <span className="text-primary mt-auto inline-flex items-center gap-2 pt-2 text-sm font-bold">
          {copy.readMore}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default async function NewsPage() {
  const locale = await getRequestLocale();
  const articles = await fetchNewsList(locale);
  const copy = newsPageCopy[locale];

  const [featured, ...rest] = articles;

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-12 md:pt-44 md:pb-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0" />
          <div className="bg-primary-fixed-dim/25 animate-blob absolute -top-24 -right-16 h-96 w-96 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="border-tertiary/30 bg-tertiary-fixed/60 text-on-tertiary-fixed mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
              <Newspaper className="h-3.5 w-3.5" />
              {copy.eyebrow}
            </span>
            <h1 className="font-headline text-on-surface text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {copy.heading}
            </h1>
            <p className="text-on-surface-variant mx-auto mt-5 max-w-2xl text-lg leading-relaxed">
              {copy.subheading}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {articles.length === 0 ? (
            <Reveal className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
              <span className="bg-surface-container text-primary/70 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Newspaper className="h-8 w-8" />
              </span>
              <p className="text-on-surface-variant text-lg">{copy.empty}</p>
            </Reveal>
          ) : (
            <div className="space-y-10">
              {featured ? (
                <Reveal>
                  <FeaturedCard article={featured} copy={copy} locale={locale} />
                </Reveal>
              ) : null}

              {rest.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article, index) => (
                    <Reveal key={article.slug} delay={index * STAGGER_MS}>
                      <NewsCard article={article} copy={copy} locale={locale} />
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
