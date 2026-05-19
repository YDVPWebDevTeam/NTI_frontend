'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';

import { ROUTES } from 'lib/constants';

import { NtiBrand } from './nti-brand';

export function Footer() {
  const legalLinks = [
    { href: ROUTES.PRIVACY_POLICY, label: t`PRIVACY POLICY` },
    { href: ROUTES.TERMS_OF_SERVICE, label: t`TERMS OF SERVICE` },
  ] as const;

  return (
    <footer className="border-t border-black/[0.07] px-4 py-5 sm:px-6 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <NtiBrand href={ROUTES.ROOT} size="sm" />
          <span className="text-center text-[10px] tracking-[0.06em] text-neutral-400 md:text-left">
            {t`© 2026 NTI. All rights reserved.`}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-end md:gap-6">
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[10px] font-normal tracking-[0.08em] text-neutral-400 transition-colors hover:text-neutral-700"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
