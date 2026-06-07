'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import { LanguageSelector } from 'components/i18n/language-switcher';
import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants';

import { NtiBrand } from './nti-brand';

export function Header() {
  return (
    <header className="bg-card/90 border-b border-black/[0.07] backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-300 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
        <NtiBrand href={ROUTES.ROOT} size="sm" />

        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center md:gap-6">
          <Link
            href={ROUTES.HOME.CONTACT}
            className="text-muted-foreground hover:text-foreground text-[11px] font-normal tracking-[0.08em] transition-colors"
          >
            {t`SUPPORT`}
          </Link>

          <LanguageSelector
            className="border-border bg-card/90"
            triggerClassName="text-foreground hover:bg-muted"
            contentClassName="border-border bg-card"
          />

          <Button asChild className="w-full md:w-auto">
            <Link href={ROUTES.AUTH.REGISTER_SELECT}>{t`Join us`}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
