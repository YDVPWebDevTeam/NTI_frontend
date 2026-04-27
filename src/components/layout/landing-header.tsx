'use client';

import { t } from '@lingui/core/macro';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { LanguageSelector } from 'components/i18n/language-switcher';
import { ROUTES } from 'lib/constants';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-md dark:bg-slate-900/80 dark:shadow-none">
      <nav className="font-manrope mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between px-6 py-4 font-bold tracking-tight">
        <div className="flex w-full items-center justify-between md:w-auto">
          <Link
            className="text-2xl font-black tracking-tighter text-blue-900 dark:text-white"
            href={ROUTES.ROOT}
          >
            NTI
          </Link>
          <button
            className="text-slate-600 md:hidden dark:text-slate-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t`Close menu` : t`Open menu`}
          >
            {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>

        <div
          className={`${mobileMenuOpen ? 'flex' : 'hidden'} w-full flex-col items-center gap-4 pt-6 md:flex md:w-auto md:flex-row md:pt-0`}
        >
          <Link
            className="text-slate-600 transition-colors hover:text-blue-900 dark:text-slate-400 dark:hover:text-white"
            href={ROUTES.HOME.PROGRAMS}
          >
            {t`Programs`}
          </Link>
          <Link
            className="text-slate-600 transition-colors hover:text-blue-900 dark:text-slate-400 dark:hover:text-white"
            href={ROUTES.HOME.MENTORS}
          >
            {t`Mentors`}
          </Link>
          <Link
            className="text-slate-600 transition-colors hover:text-blue-900 dark:text-slate-400 dark:hover:text-white"
            href={ROUTES.HOME.NEWS}
          >
            {t`News`}
          </Link>
        </div>

        <div
          className={`${mobileMenuOpen ? 'flex' : 'hidden'} w-full flex-col items-center gap-3 pt-6 md:flex md:w-auto md:flex-row md:pt-0`}
        >
          <LanguageSelector
            className="border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80"
            triggerClassName="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70"
            contentClassName="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          />
          <Link
            className="w-full px-4 py-2 text-center font-bold text-slate-600 transition-all hover:text-blue-900 md:w-auto dark:text-slate-400"
            href={ROUTES.AUTH.LOGIN}
          >
            {t`Login`}
          </Link>
          <Link
            className="primary-gradient w-full scale-95 rounded-lg px-6 py-2.5 text-center text-white shadow-lg transition-transform active:opacity-80 md:w-auto"
            href={ROUTES.AUTH.REGISTER_SELECT}
          >
            {t`Register`}
          </Link>
        </div>
      </nav>
    </header>
  );
}
