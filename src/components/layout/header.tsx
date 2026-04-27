'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import { LanguageSelector } from 'components/i18n/language-switcher';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';

export function Header() {
  return (
    <header className="border-b border-black/[0.07] bg-[#f5f4f0]/90 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-300 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
        <Link
          href={ROUTES.ROOT}
          className="text-sm font-bold tracking-[0.1em] text-neutral-900 hover:text-neutral-700"
        >
          {t`NTI`}
        </Link>

        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center md:gap-6">
          <Link
            href={ROUTES.HOME.CONTACT}
            className="text-[11px] font-normal tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-900"
          >
            {t`SUPPORT`}
          </Link>

          <LanguageSelector
            className="border-black/10 bg-white/90"
            triggerClassName="text-neutral-700 hover:bg-black/5"
            contentClassName="border-black/10 bg-white"
          />

          <Button asChild className="w-full md:w-auto">
            <Link href={ROUTES.AUTH.REGISTER_SELECT}>{t`Join us`}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
