import Link from 'next/link';

import { ROUTES } from 'lib/constants';

type ContentUnavailableProps = {
  /** Eyebrow above the heading, e.g. the page name. */
  eyebrow: string;
  /** Main heading, e.g. "Content temporarily unavailable". */
  title: string;
  /** Supporting copy explaining the transient outage. */
  description: string;
  /** Label for the "back home" link. */
  homeLabel: string;
};

/**
 * Graceful fallback rendered when a CMS-backed marketing page can't load its
 * content (CMS unconfigured / unreachable). Unlike `notFound()`, this keeps the
 * page resolving (200) and tells the visitor the outage is temporary, which is
 * the correct signal for a transient backend hiccup rather than a real 404.
 */
export function ContentUnavailable({
  eyebrow,
  title,
  description,
  homeLabel,
}: ContentUnavailableProps) {
  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-tertiary text-sm font-bold tracking-[0.2em] uppercase">{eyebrow}</p>

        <h1 className="font-headline text-on-surface mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>

        <p className="text-on-surface-variant mx-auto mt-5 max-w-md text-lg leading-relaxed">
          {description}
        </p>

        <Link
          href={ROUTES.ROOT}
          className="bg-surface-container-highest text-primary ring-primary/10 hover:bg-surface-container-high mt-8 inline-flex items-center justify-center rounded-xl px-8 py-3.5 font-bold ring-1 transition-all hover:-translate-y-0.5"
        >
          {homeLabel}
        </Link>
      </div>
    </main>
  );
}
