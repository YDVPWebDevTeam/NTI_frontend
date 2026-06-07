import { msg } from '@lingui/core/macro';
import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter, LandingHeader } from 'components/layout';
import { ROUTES } from 'lib/constants';
import { getServerI18n } from 'lib/i18n/server-i18n';
import { getRequestLocale } from 'lib/i18n/server-locale';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getServerI18n(await getRequestLocale());

  return {
    title: `${i18n._(msg`Page not found`)} — NTI`,
  };
}

export default async function NotFound() {
  const i18n = await getServerI18n(await getRequestLocale());

  return (
    <div className="bg-surface font-body text-on-surface flex min-h-screen flex-col overflow-x-hidden antialiased">
      <LandingHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-32">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-tertiary text-sm font-bold tracking-[0.2em] uppercase">
            {i18n._(msg`Error 404`)}
          </p>

          <h1 className="font-headline text-on-surface mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {i18n._(msg`Page not found`)}
          </h1>

          <p className="text-on-surface-variant mx-auto mt-5 max-w-md text-lg leading-relaxed">
            {i18n._(msg`The page you are looking for doesn't exist or may have been moved.`)}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={ROUTES.ROOT}
              className="primary-gradient shadow-primary/25 inline-flex w-full items-center justify-center rounded-xl px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              {i18n._(msg`Back to home`)}
            </Link>

            <Link
              href={ROUTES.NEWS}
              className="bg-surface-container-highest text-primary ring-primary/10 hover:bg-surface-container-high inline-flex w-full items-center justify-center rounded-xl px-8 py-3.5 font-bold ring-1 transition-all hover:-translate-y-0.5 sm:w-auto"
            >
              {i18n._(msg`Read the news`)}
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
