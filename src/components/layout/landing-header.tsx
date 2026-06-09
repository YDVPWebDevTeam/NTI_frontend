'use client';

import { t } from '@lingui/core/macro';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { LanguageSelector } from 'components/i18n/language-switcher';
import { ROUTES } from 'lib/constants';

import { LandingAuthActions } from './landing-auth-actions';
import { NtiBrand } from './nti-brand';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-card/80 fixed top-0 z-50 w-full shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between px-6 py-4 font-bold tracking-tight">
        <div className="flex w-full items-center justify-between lg:w-auto">
          <NtiBrand href={ROUTES.ROOT} variant="landing" size="md" />

          <button
            className="text-muted-foreground lg:hidden"
            onClick={() => setMobileMenuOpen((previousState) => !previousState)}
            aria-label={mobileMenuOpen ? t`Close menu` : t`Open menu`}
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>

        <div
          className={`${
            mobileMenuOpen ? 'flex' : 'hidden'
          } w-full flex-col items-center gap-4 pt-6 lg:flex lg:w-auto lg:flex-row lg:pt-0`}
        >
          <Link
            className="text-muted-foreground hover:text-primary transition-colors"
            href={ROUTES.ABOUT}
            onClick={closeMobileMenu}
          >
            {t`About`}
          </Link>

          <Link
            className="text-muted-foreground hover:text-primary transition-colors"
            href={ROUTES.PROGRAMS}
            onClick={closeMobileMenu}
          >
            {t`Programs`}
          </Link>

          <Link
            className="text-muted-foreground hover:text-primary transition-colors"
            href={ROUTES.CALLS}
            onClick={closeMobileMenu}
          >
            {t`Calls`}
          </Link>

          <Link
            className="text-muted-foreground hover:text-primary transition-colors"
            href={ROUTES.MENTORS}
            onClick={closeMobileMenu}
          >
            {t`Mentors`}
          </Link>

          <Link
            className="text-muted-foreground hover:text-primary transition-colors"
            href={ROUTES.PARTNERS}
            onClick={closeMobileMenu}
          >
            {t`Partners`}
          </Link>

          <Link
            className="text-muted-foreground hover:text-primary transition-colors"
            href={ROUTES.NEWS}
            onClick={closeMobileMenu}
          >
            {t`News`}
          </Link>
        </div>

        <div
          className={`${
            mobileMenuOpen ? 'flex' : 'hidden'
          } w-full flex-col items-center gap-3 pt-6 lg:flex lg:w-auto lg:flex-row lg:pt-0`}
        >
          <LanguageSelector
            className="border-border bg-card/90"
            triggerClassName="text-foreground hover:bg-muted"
            contentClassName="border-border bg-card"
          />

          <LandingAuthActions
            className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row"
            authenticatedClassName="primary-gradient w-full scale-95 rounded-lg px-6 py-2.5 text-center text-white shadow-lg transition-transform active:opacity-80 md:w-auto"
            unauthenticatedActions={[
              {
                className:
                  'w-full px-4 py-2 text-center font-bold text-muted-foreground transition-all hover:text-primary md:w-auto',
                href: ROUTES.AUTH.LOGIN,
                label: t`Login`,
              },
              {
                className:
                  'primary-gradient w-full scale-95 rounded-lg px-6 py-2.5 text-center text-white shadow-lg transition-transform active:opacity-80 md:w-auto',
                href: ROUTES.AUTH.REGISTER_SELECT,
                label: t`Register`,
              },
            ]}
          />
        </div>
      </nav>
    </header>
  );
}
