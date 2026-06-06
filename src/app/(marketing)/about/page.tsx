import type { Metadata } from 'next';

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

type AboutContent = {
  metaTitle: string;
  hero: { eyebrow: string; title: string; description: string };
  what: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  values: { eyebrow: string; title: string; features: MarketingFeature[] };
  cta: { title: string; description: string; actions: MarketingAction[] };
};

const content: Record<AppLocale, AboutContent> = {
  en: {
    metaTitle: 'About NTI',
    hero: {
      eyebrow: 'About us',
      title: 'Turning bold ideas into high-performance companies',
      description:
        'The Nitra Technology Incubator (NTI) bridges the gap between academic research and market reality. We give students, teams and founders the funding, mentoring and infrastructure to build what comes next — and we keep that talent in the region.',
    },
    what: {
      eyebrow: 'What we do',
      title: 'One ecosystem, two paths to impact',
      description:
        'Whether you arrive with your own product idea or the ambition to solve a real corporate challenge, there is a track built around you.',
      features: [
        {
          icon: 'rocket',
          title: 'Program A — Venture Launch',
          description:
            'For founders with their own product idea. Move from prototype to a market-ready company with full incubation support.',
        },
        {
          icon: 'building',
          title: 'Program B — Industry Bridge',
          description:
            'Solve real challenges defined by our corporate partners and gain professional experience while you build.',
        },
        {
          icon: 'mentor',
          title: 'Mentoring network',
          description:
            'Work one-on-one with experienced operators and researchers across AI, hardware and go-to-market.',
        },
        {
          icon: 'flask',
          title: 'Full-cycle infrastructure',
          description:
            'Premium workspaces, prototyping labs and legal support to help you scale with confidence.',
        },
        {
          icon: 'globe',
          title: 'Regional & European reach',
          description:
            'Connections to university research and leading European technology clusters.',
        },
        {
          icon: 'users',
          title: 'Talent retention',
          description:
            'We keep bright minds in Nitra by turning local opportunity into lasting careers.',
        },
      ],
    },
    values: {
      eyebrow: 'What drives us',
      title: 'The principles behind the incubator',
      features: [
        {
          icon: 'target',
          title: 'Precision over hype',
          description:
            'We back substance: validated problems, real users and disciplined execution.',
        },
        {
          icon: 'handshake',
          title: 'Partnership first',
          description:
            'Founders, mentors and companies win together. Collaboration is built into every program.',
        },
        {
          icon: 'trending',
          title: 'Built to scale',
          description:
            'Everything we do is designed to take an idea from prototype to sustainable growth.',
        },
      ],
    },
    cta: {
      title: 'Ready to build the future of Nitra?',
      description:
        'Join a community of innovators, engineers and entrepreneurs. Apply as a student or bring a challenge as a company.',
      actions: [
        { label: 'Apply as student', href: ROUTES.AUTH.REGISTER_STUDENT, variant: 'primary' },
        { label: 'Submit a challenge', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'secondary' },
      ],
    },
  },
  sk: {
    metaTitle: 'O NTI',
    hero: {
      eyebrow: 'O nás',
      title: 'Meníme odvážne nápady na výkonné firmy',
      description:
        'Nitriansky technologický inkubátor (NTI) prepája akademický výskum s realitou trhu. Študentom, tímom a zakladateľom dávame financovanie, mentorstvo a zázemie, aby vytvorili to ďalšie — a talent udržiavame v regióne.',
    },
    what: {
      eyebrow: 'Čo robíme',
      title: 'Jeden ekosystém, dve cesty k dopadu',
      description:
        'Či prichádzate s vlastným produktovým nápadom alebo s ambíciou riešiť skutočnú firemnú výzvu, máme cestu postavenú pre vás.',
      features: [
        {
          icon: 'rocket',
          title: 'Program A — Rozbeh startupu',
          description:
            'Pre zakladateľov s vlastným produktovým nápadom. Posuňte sa od prototypu k firme pripravenej na trh s plnou inkubačnou podporou.',
        },
        {
          icon: 'building',
          title: 'Program B — Prepojenie s priemyslom',
          description:
            'Riešte skutočné výzvy od firemných partnerov a získajte odbornú prax priamo pri tvorbe riešení.',
        },
        {
          icon: 'mentor',
          title: 'Mentorská sieť',
          description:
            'Pracujte individuálne so skúsenými odborníkmi a výskumníkmi v oblasti AI, hardvéru a vstupu na trh.',
        },
        {
          icon: 'flask',
          title: 'Plnohodnotné zázemie',
          description:
            'Moderné priestory, prototypovacie laboratóriá a právna podpora, aby ste rástli s istotou.',
        },
        {
          icon: 'globe',
          title: 'Regionálny a európsky dosah',
          description: 'Prepojenia na univerzitný výskum a popredné európske technologické centrá.',
        },
        {
          icon: 'users',
          title: 'Udržanie talentu',
          description:
            'Bystré hlavy udržiavame v Nitre tým, že lokálne príležitosti meníme na trvalé kariéry.',
        },
      ],
    },
    values: {
      eyebrow: 'Čo nás ženie',
      title: 'Princípy za inkubátorom',
      features: [
        {
          icon: 'target',
          title: 'Presnosť namiesto humbuku',
          description:
            'Stojíme za podstatou: overené problémy, skutoční používatelia a disciplinovaná realizácia.',
        },
        {
          icon: 'handshake',
          title: 'Partnerstvo na prvom mieste',
          description:
            'Zakladatelia, mentori a firmy vyhrávajú spoločne. Spolupráca je súčasťou každého programu.',
        },
        {
          icon: 'trending',
          title: 'Postavené na rast',
          description:
            'Všetko, čo robíme, je navrhnuté tak, aby posunulo nápad od prototypu k udržateľnému rastu.',
        },
      ],
    },
    cta: {
      title: 'Ste pripravení budovať budúcnosť Nitry?',
      description:
        'Pridajte sa ku komunite inovátorov, inžinierov a podnikateľov. Prihláste sa ako študent alebo prineste výzvu ako firma.',
      actions: [
        {
          label: 'Prihlásiť sa ako študent',
          href: ROUTES.AUTH.REGISTER_STUDENT,
          variant: 'primary',
        },
        { label: 'Pridať výzvu', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'secondary' },
      ],
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = content[locale];

  return { title: `${c.metaTitle} — NTI`, description: c.hero.description };
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const c = content[locale];

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

      <CTASection title={c.cta.title} description={c.cta.description} actions={c.cta.actions} />
    </MarketingPageShell>
  );
}
