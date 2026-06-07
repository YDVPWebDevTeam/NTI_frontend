import { msg } from '@lingui/core/macro';
import Link from 'next/link';
import { Suspense } from 'react';

import { ContactSection } from 'components/marketing/contact-section';
import { ROUTES } from 'lib/constants';
import { getServerI18n } from 'lib/i18n/server-i18n';
import { getRequestLocale } from 'lib/i18n/server-locale';

import { NtiBrand } from './nti-brand';

/** True when a route is an absolute, off-site URL (http/https). */
function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export async function LandingFooter() {
  const i18n = await getServerI18n(await getRequestLocale());

  const externalLinkProps = {
    target: '_blank',
    rel: 'noopener noreferrer',
  } as const;

  return (
    <>
      {/*
        ContactSection reads `useSearchParams()`, which opts the subtree into
        client-side rendering and must sit under a Suspense boundary so it does
        not de-opt the whole page / break the static build.
      */}
      <Suspense fallback={null}>
        <ContactSection />
      </Suspense>

      <footer className="border-border bg-background w-full border-t">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 py-12 text-sm antialiased md:grid-cols-4">
          <div className="space-y-4">
            <NtiBrand href={ROUTES.ROOT} variant="landing" size="sm" />

            <p className="text-muted-foreground">
              {i18n._(
                msg`Driving innovation and economic growth through technology and academic collaboration.`,
              )}
            </p>
          </div>

          <div>
            <h6 className="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">
              {i18n._(msg`Explore`)}
            </h6>

            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.ABOUT}
                >
                  {i18n._(msg`About`)}
                </Link>
              </li>

              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.PROGRAMS}
                >
                  {i18n._(msg`Programs`)}
                </Link>
              </li>

              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.CALLS}
                >
                  {i18n._(msg`Calls & Deadlines`)}
                </Link>
              </li>

              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.MENTORS}
                >
                  {i18n._(msg`Mentors`)}
                </Link>
              </li>

              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.PARTNERS}
                >
                  {i18n._(msg`Partners`)}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">
              {i18n._(msg`Resources`)}
            </h6>

            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.NEWS}
                >
                  {i18n._(msg`News`)}
                </Link>
              </li>

              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.PRIVACY_POLICY}
                >
                  {i18n._(msg`Privacy Policy`)}
                </Link>
              </li>

              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.TERMS_OF_SERVICE}
                >
                  {i18n._(msg`Terms of Service`)}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">
              {i18n._(msg`Connect`)}
            </h6>

            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.HOME.CONTACT}
                >
                  {i18n._(msg`Contact Us`)}
                </Link>
              </li>

              <li>
                <a
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.SOCIAL.LINKEDIN}
                  {...externalLinkProps}
                >
                  {i18n._(msg`LinkedIn`)}
                </a>
              </li>

              <li>
                <a
                  className="text-muted-foreground hover:text-primary transition-colors"
                  href={ROUTES.SOCIAL.TWITTER}
                  {...externalLinkProps}
                >
                  {i18n._(msg`Twitter`)}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border border-t">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-8 py-6 text-center">
            <Link
              className="text-foreground hover:text-primary text-sm font-medium transition-colors"
              href={ROUTES.ADMIN.LOGIN}
              {...(isExternalHref(ROUTES.ADMIN.LOGIN) ? externalLinkProps : {})}
            >
              {i18n._(msg`Admin Login`)}
            </Link>

            <span className="text-muted-foreground text-xs">
              {i18n._(msg`© 2026 NTI. All rights reserved.`)}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
