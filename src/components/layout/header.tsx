'use client';

import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '../shadcn/button';
import Link from 'next/link';
import { ROUTES } from '@/src/lib/constants';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [t`PRECISION ENGINE FRAMEWORK`, t`SUPPORT`];

  return (
    <header className="border-b border-black/[0.07] bg-[#f5f4f0]">
      <nav className="mx-auto flex h-14 w-full max-w-300 items-center justify-between px-4 sm:px-6 lg:px-12">
        <Link
          href={ROUTES.ROOT}
          className="text-sm font-bold tracking-[0.1em] text-neutral-900 hover:text-neutral-700"
        >
          {t`NTI`}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              type="button"
              key={item}
              className="text-[11px] font-normal tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {item}
            </button>
          ))}
          <Button asChild>
            <Link href={ROUTES.AUTH.REGISTER_SELECT}>{t`Join us`}</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-neutral-700 transition-colors hover:bg-black/4 hover:text-neutral-900 md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? t`Close menu` : t`Open menu`}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-nav" className="border-t border-black/[0.07] px-4 py-3 sm:px-6 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                type="button"
                key={item}
                className="text-left text-[11px] font-normal tracking-[0.08em] text-neutral-600 transition-colors hover:text-neutral-900"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </button>
            ))}
            <Button asChild className="mt-1 w-full">
              <Link href={ROUTES.AUTH.REGISTER_SELECT}>{t`Join us`}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
