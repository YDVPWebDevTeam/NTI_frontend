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
    title: `${i18n._(msg`Privacy Policy`)} — NTI`,
    description: i18n._(
      msg`How NTI collects, uses, and protects the personal information you share with us.`,
    ),
  };
}

export default async function PrivacyPolicyPage() {
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
        title={i18n._(msg`Privacy Policy`)}
        description={i18n._(
          msg`How NTI collects, uses, and protects the personal information you share with us.`,
        )}
      />

      <section className="bg-surface-container-low py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-on-surface-variant text-sm">
            {i18n._(msg`Last updated: ${formattedDate}`)}
          </p>

          <div className="text-on-surface-variant mt-8 space-y-6 leading-relaxed">
            <p>
              {i18n._(
                msg`This page is a placeholder for NTI's privacy policy. The final policy is being prepared. Until it is published, please contact us with any questions about how your data is handled.`,
              )}
            </p>

            <div>
              <h2 className="font-headline text-on-surface mb-2 text-xl font-bold">
                {i18n._(msg`Information we collect`)}
              </h2>
              <p>
                {i18n._(
                  msg`We collect the information you provide when you register, apply to a program, or contact us — such as your name, email address, and any details you choose to share.`,
                )}
              </p>
            </div>

            <div>
              <h2 className="font-headline text-on-surface mb-2 text-xl font-bold">
                {i18n._(msg`How we use it`)}
              </h2>
              <p>
                {i18n._(
                  msg`Your information is used to operate the platform, process applications, and respond to your requests. We do not sell your personal data.`,
                )}
              </p>
            </div>

            <div>
              <h2 className="font-headline text-on-surface mb-2 text-xl font-bold">
                {i18n._(msg`Contact`)}
              </h2>
              <p>
                {i18n._(
                  msg`If you have questions about this policy or your data, please reach out through our contact form.`,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
