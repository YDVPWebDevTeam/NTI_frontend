import { msg } from '@lingui/core/macro';
import type { Metadata } from 'next';

import {
  ContentUnavailable,
  CTASection,
  FeatureGrid,
  MarketingHero,
  MarketingPageShell,
  SectionHeading,
} from 'components/marketing';
import { fetchAboutContent } from 'lib/cms/about';
import { getServerI18n } from 'lib/i18n/server-i18n';
import { getRequestLocale } from 'lib/i18n/server-locale';
import { aboutStatic } from 'lib/marketing/static-content';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = await fetchAboutContent(locale);

  return {
    title: `${aboutStatic[locale].metaTitle} — NTI`,
    description: c?.hero.description,
  };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const c = await fetchAboutContent(locale);

  if (!c) {
    const i18n = await getServerI18n(locale);

    return (
      <ContentUnavailable
        eyebrow={aboutStatic[locale].metaTitle}
        title={i18n._(msg`Content temporarily unavailable`)}
        description={i18n._(
          msg`We couldn't load this page right now. Please try again in a few minutes.`,
        )}
        homeLabel={i18n._(msg`Back to home`)}
      />
    );
  }

  const cta = aboutStatic[locale];

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        description={c.hero.description}
      />

      <section className="bg-surface-container-low py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={c.what.eyebrow}
            title={c.what.title}
            description={c.what.description}
          />
          <FeatureGrid features={c.what.features} />
        </div>
      </section>

      <section className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow={c.values.eyebrow} title={c.values.title} align="center" />
          <FeatureGrid features={c.values.features} />
        </div>
      </section>

      <CTASection title={c.cta.title} description={c.cta.description} actions={cta.ctaActions} />
    </MarketingPageShell>
  );
}
