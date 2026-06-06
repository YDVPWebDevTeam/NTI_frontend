import type { Metadata } from 'next';
import Image from 'next/image';

import { Reveal } from 'components/landing';
import {
  CTASection,
  FeatureGrid,
  MarketingHero,
  MarketingPageShell,
  SectionHeading,
  type MarketingAction,
  type MarketingFeature,
} from 'components/marketing';
import { ROUTES } from 'lib/constants';
import { type AppLocale } from 'lib/i18n/config';
import { getRequestLocale } from 'lib/i18n/server-locale';

const STAGGER_MS = 90;

type Mentor = {
  name: string;
  role: string;
  bio: string;
  image: { url: string; alt: string };
};

type MentorsContent = {
  metaTitle: string;
  hero: { eyebrow: string; title: string; description: string; actions: MarketingAction[] };
  value: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  people: { eyebrow: string; title: string; description: string; mentors: Mentor[] };
  cta: { title: string; description: string; actions: MarketingAction[] };
};

const content: Record<AppLocale, MentorsContent> = {
  en: {
    metaTitle: 'Mentors',
    hero: {
      eyebrow: 'Mentoring',
      title: 'Guided by people who have built it before',
      description:
        'Mentoring is at the heart of NTI. Our network of operators, researchers and founders works one-on-one with teams across both programs — and we are always looking for new experts to join.',
      actions: [
        { label: 'Become a mentor', href: ROUTES.contact('mentor'), variant: 'primary' },
        { label: 'Explore the programs', href: ROUTES.PROGRAMS, variant: 'secondary' },
      ],
    },
    value: {
      eyebrow: 'Why it matters',
      title: 'What mentoring delivers',
      description: 'Great mentoring is the difference between a promising idea and a real company.',
      features: [
        {
          icon: 'mentor',
          title: '1-on-1 guidance',
          description: 'Dedicated mentors meet teams regularly to unblock problems and set focus.',
        },
        {
          icon: 'target',
          title: 'Sharper decisions',
          description:
            'Experience helps founders avoid common pitfalls and move faster with less risk.',
        },
        {
          icon: 'network',
          title: 'Access to a network',
          description: 'Mentors open doors to partners, investors and the wider ecosystem.',
        },
      ],
    },
    people: {
      eyebrow: 'Our ecosystem',
      title: 'Meet some of our mentors',
      description:
        'Experts across AI, hardware, business strategy and product, supporting teams in Nitra and beyond.',
      mentors: [
        {
          name: 'Ing. Marek Novák',
          role: 'Lead Mentor · AI Systems',
          bio: 'Expert in neural networks with 15+ years in international R&D.',
          image: { url: '/images/business-ideas.png', alt: 'Portrait of Marek Novák' },
        },
        {
          name: 'Dr. Lucia Bieliková',
          role: 'Business Strategy',
          bio: 'Specialises in market-entry strategies for DeepTech startups.',
          image: { url: '/images/full-cycle-incubation.png', alt: 'Portrait of Lucia Bieliková' },
        },
        {
          name: 'Ing. Peter Horák',
          role: 'Hardware & Prototyping',
          bio: 'Helps teams go from breadboard to manufacturable product.',
          image: { url: '/images/mentor-explaining.png', alt: 'Portrait of Peter Horák' },
        },
        {
          name: 'Mgr. Eva Kováčová',
          role: 'Product & Go-to-Market',
          bio: 'Guides founders on product discovery and reaching first customers.',
          image: { url: '/images/students-working.png', alt: 'Portrait of Eva Kováčová' },
        },
      ],
    },
    cta: {
      title: 'Share your experience — mentor a team',
      description:
        'Experienced operators and researchers are the backbone of NTI. Get involved and give back to the regional ecosystem.',
      actions: [
        { label: 'Become a mentor', href: ROUTES.contact('mentor'), variant: 'primary' },
        { label: 'About NTI', href: ROUTES.ABOUT, variant: 'secondary' },
      ],
    },
  },
  sk: {
    metaTitle: 'Mentori',
    hero: {
      eyebrow: 'Mentoring',
      title: 'Pod vedením ľudí, ktorí to už postavili',
      description:
        'Mentoring je srdcom NTI. Naša sieť odborníkov, výskumníkov a zakladateľov pracuje individuálne s tímami v oboch programoch — a stále hľadáme nových expertov.',
      actions: [
        { label: 'Stať sa mentorom', href: ROUTES.contact('mentor'), variant: 'primary' },
        { label: 'Preskúmať programy', href: ROUTES.PROGRAMS, variant: 'secondary' },
      ],
    },
    value: {
      eyebrow: 'Prečo na tom záleží',
      title: 'Čo mentoring prináša',
      description: 'Kvalitný mentoring je rozdiel medzi sľubným nápadom a skutočnou firmou.',
      features: [
        {
          icon: 'mentor',
          title: 'Individuálne vedenie',
          description:
            'Mentori sa pravidelne stretávajú s tímami, odblokujú problémy a nastavia smer.',
        },
        {
          icon: 'target',
          title: 'Lepšie rozhodnutia',
          description:
            'Skúsenosti pomáhajú zakladateľom vyhnúť sa chybám a napredovať s menším rizikom.',
        },
        {
          icon: 'network',
          title: 'Prístup k sieti',
          description: 'Mentori otvárajú dvere k partnerom, investorom a širšiemu ekosystému.',
        },
      ],
    },
    people: {
      eyebrow: 'Náš ekosystém',
      title: 'Spoznajte niektorých z našich mentorov',
      description:
        'Odborníci na AI, hardvér, biznis stratégiu a produkt, ktorí podporujú tímy v Nitre aj mimo nej.',
      mentors: [
        {
          name: 'Ing. Marek Novák',
          role: 'Hlavný mentor · AI systémy',
          bio: 'Expert na neurónové siete s viac ako 15 rokmi medzinárodného výskumu a vývoja.',
          image: { url: '/images/business-ideas.png', alt: 'Portrét Mareka Nováka' },
        },
        {
          name: 'Dr. Lucia Bieliková',
          role: 'Biznis stratégia',
          bio: 'Špecializuje sa na stratégie vstupu na trh pre DeepTech startupy.',
          image: { url: '/images/full-cycle-incubation.png', alt: 'Portrét Lucie Bielikovej' },
        },
        {
          name: 'Ing. Peter Horák',
          role: 'Hardvér a prototypovanie',
          bio: 'Pomáha tímom dostať sa od prototypu k vyrobiteľnému produktu.',
          image: { url: '/images/mentor-explaining.png', alt: 'Portrét Petra Horáka' },
        },
        {
          name: 'Mgr. Eva Kováčová',
          role: 'Produkt a vstup na trh',
          bio: 'Vedie zakladateľov pri objavovaní produktu a získavaní prvých zákazníkov.',
          image: { url: '/images/students-working.png', alt: 'Portrét Evy Kováčovej' },
        },
      ],
    },
    cta: {
      title: 'Zdieľajte svoje skúsenosti — mentorujte tím',
      description:
        'Skúsení odborníci a výskumníci sú chrbtovou kosťou NTI. Zapojte sa a prispejte regionálnemu ekosystému.',
      actions: [
        { label: 'Stať sa mentorom', href: ROUTES.contact('mentor'), variant: 'primary' },
        { label: 'O NTI', href: ROUTES.ABOUT, variant: 'secondary' },
      ],
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = content[locale];

  return { title: `${c.metaTitle} — NTI`, description: c.hero.description };
}

export default async function MentorsPage() {
  const locale = await getRequestLocale();
  const c = content[locale];

  return (
    <MarketingPageShell>
      <MarketingHero
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        description={c.hero.description}
        actions={c.hero.actions}
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

      <CTASection title={c.cta.title} description={c.cta.description} actions={c.cta.actions} />
    </MarketingPageShell>
  );
}
