import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Reveal } from 'components/landing';
import {
  CTASection,
  FeatureGrid,
  MarketingHero,
  MarketingPageShell,
  SectionHeading,
} from 'components/marketing';
import { fetchMentorsContent } from 'lib/cms/mentors';
import { getRequestLocale } from 'lib/i18n/server-locale';
import { mentorsStatic } from 'lib/marketing/static-content';

const STAGGER_MS = 90;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = await fetchMentorsContent(locale);

  return {
    title: `${mentorsStatic[locale].metaTitle} — NTI`,
    description: c?.hero.description,
  };
}

export default async function MentorsPage() {
  const locale = await getRequestLocale();
  const c = await fetchMentorsContent(locale);

  if (!c) {
    notFound();
  }

  const cta = mentorsStatic[locale];

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
            eyebrow={c.value.eyebrow}
            title={c.value.title}
            description={c.value.description}
          />
          <FeatureGrid features={c.value.features} />
        </div>
      </section>

      <section className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={c.people.eyebrow}
            title={c.people.title}
            description={c.people.description}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.people.mentors.map((mentor, index) => (
              <Reveal key={mentor.name} delay={index * STAGGER_MS}>
                <div className="group bg-surface-container-lowest hover:shadow-primary/10 h-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      fill
                      alt={mentor.image.alt}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      src={mentor.image.url}
                      unoptimized
                    />
                    <div className="from-primary/40 absolute inset-0 bg-gradient-to-t to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-headline text-on-surface font-bold">{mentor.name}</h3>
                    <p className="text-tertiary mt-0.5 text-xs font-bold">{mentor.role}</p>
                    <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
                      {mentor.bio}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection title={c.cta.title} description={c.cta.description} actions={cta.ctaActions} />
    </MarketingPageShell>
  );
}
