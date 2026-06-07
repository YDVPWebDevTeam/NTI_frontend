import { msg } from '@lingui/core/macro';
import type { Metadata } from 'next';

import { MarketingHero, MarketingPageShell } from 'components/marketing';
import { getServerI18n } from 'lib/i18n/server-i18n';
import { getRequestLocale } from 'lib/i18n/server-locale';

/** Date this placeholder legal copy was last reviewed. */
const LAST_UPDATED = '2026-06-07';

export async function generateMetadata(): Promise<Metadata> {
  const i18n = await getServerI18n(await getRequestLocale());

  return {
    title: `${i18n._(msg`Terms of Service`)} — NTI`,
    description: i18n._(msg`The terms that govern your use of the NTI platform.`),
  };
}

export default async function TermsOfServicePage() {
  const locale = await getRequestLocale();
  const i18n = await getServerI18n(locale);

  const formattedDate = new Intl.DateTimeFormat(locale === 'sk' ? 'sk-SK' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(LAST_UPDATED));

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow={i18n._(msg`Legal`)}
        title={i18n._(msg`Terms of Service`)}
        description={i18n._(msg`The terms that govern your use of the NTI platform.`)}
      />

      <section className="bg-surface-container-low py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-on-surface-variant text-sm">
            {i18n._(msg`Last updated: ${formattedDate}`)}
          </p>

          <div className="text-on-surface-variant mt-8 space-y-6 leading-relaxed">
            <p>
              {i18n._(
                msg`This page is a placeholder for NTI's terms of service. The final terms are being prepared. Until they are published, the summary below describes how we expect the platform to be used.`,
              )}
            </p>

            <div>
              <h2 className="font-headline text-on-surface mb-2 text-xl font-bold">
                {i18n._(msg`Using the platform`)}
              </h2>
              <p>
                {i18n._(
                  msg`By accessing NTI you agree to use the platform lawfully and to provide accurate information when you register or apply to a program.`,
                )}
              </p>
            </div>

            <div>
              <h2 className="font-headline text-on-surface mb-2 text-xl font-bold">
                {i18n._(msg`Your content`)}
              </h2>
              <p>
                {i18n._(
                  msg`You retain ownership of the content you submit. You are responsible for ensuring you have the right to share it.`,
                )}
              </p>
            </div>

            <div>
              <h2 className="font-headline text-on-surface mb-2 text-xl font-bold">
                {i18n._(msg`Changes`)}
              </h2>
              <p>
                {i18n._(
                  msg`We may update these terms from time to time. Continued use of the platform after an update means you accept the revised terms.`,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
