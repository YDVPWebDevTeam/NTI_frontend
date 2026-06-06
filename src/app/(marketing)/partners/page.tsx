import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Reveal } from 'components/landing';
import {
  CTASection,
  FeatureGrid,
  MarketingHero,
  MarketingPageShell,
  SectionHeading,
} from 'components/marketing';
import { fetchPartnersContent } from 'lib/cms/partners';
import { getRequestLocale } from 'lib/i18n/server-locale';
import { partnersStatic } from 'lib/marketing/static-content';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = await fetchPartnersContent(locale);

  return {
    title: `${partnersStatic[locale].metaTitle} — NTI`,
    description: c?.hero.description,
  };
}

export default async function PartnersPage() {
  const locale = await getRequestLocale();
  const c = await fetchPartnersContent(locale);

  if (!c) {
    notFound();
  }

  const cta = partnersStatic[locale];

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        description={c.hero.description}
        actions={cta.heroActions}
      />

      <section className="bg-surface-container-low py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={c.why.eyebrow}
            title={c.why.title}
            description={c.why.description}
          />
          <FeatureGrid features={c.why.features} />
        </div>
      </section>

      <section className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={c.ways.eyebrow}
            title={c.ways.title}
            description={c.ways.description}
          />
          <FeatureGrid features={c.ways.features} />
        </div>
      </section>

      <section className="bg-surface-container-low border-outline-variant/20 border-y py-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-on-surface-variant/70 mb-8 text-center text-xs font-bold tracking-[0.2em] uppercase">
            {c.logos.label}
          </p>
          <Reveal className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {c.logos.items.map((logo) => (
              <span
                key={logo}
                className="text-on-surface-variant/40 text-2xl font-black tracking-tighter"
              >
                {logo}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <CTASection title={c.cta.title} description={c.cta.description} actions={cta.ctaActions} />
    </MarketingPageShell>
  );
}
