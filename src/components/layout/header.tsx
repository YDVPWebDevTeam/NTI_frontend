'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import { LanguageSelector } from 'components/i18n/language-switcher';
import { ROUTES } from 'lib/constants';

import { LandingAuthActions } from './landing-auth-actions';
import { NtiBrand } from './nti-brand';

const headerActionClassName =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 md:w-auto';

export function Header() {
  return (
    <header className="border-b border-black/[0.07] bg-[#f5f4f0]/90 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-300 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
        <NtiBrand href={ROUTES.ROOT} size="sm" />

        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center md:gap-6">
          <Link
            href={ROUTES.HOME.CONTACT}
            className="text-center text-[11px] font-normal tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-900 md:text-left"
          >
            {t`SUPPORT`}
          </Link>

          <LanguageSelector
            className="border-black/10 bg-white/90"
            triggerClassName="text-neutral-700 hover:bg-black/5"
            contentClassName="border-black/10 bg-white"
          />

          <LandingAuthActions
            authenticatedClassName={headerActionClassName}
            loadingFallback={
              <div
                className="h-11 w-full animate-pulse rounded-md bg-black/10 md:w-28"
                aria-hidden="true"
              />
            }
            unauthenticatedActions={[
              {
                href: ROUTES.AUTH.REGISTER_SELECT,
                label: t`Join us`,
                className: headerActionClassName,
              },
            ]}
          />
        </div>
      </nav>
    </header>
  );
}
