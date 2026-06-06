import type { Metadata } from 'next';

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

type PartnersContent = {
  metaTitle: string;
  hero: { eyebrow: string; title: string; description: string; actions: MarketingAction[] };
  why: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  ways: { eyebrow: string; title: string; description: string; features: MarketingFeature[] };
  logos: { label: string; items: string[] };
  cta: { title: string; description: string; actions: MarketingAction[] };
};

const content: Record<AppLocale, PartnersContent> = {
  en: {
    metaTitle: 'Partners',
    hero: {
      eyebrow: 'For partners',
      title: 'Partner with the next generation of builders',
      description:
        'Companies, universities and investors shape the NTI ecosystem. Partner with us to access fresh talent, co-create breakthrough solutions and strengthen the regional innovation economy.',
      actions: [
        { label: 'Become a partner', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
        { label: 'Explore Programs', href: ROUTES.programs('b'), variant: 'secondary' },
      ],
    },
    why: {
      eyebrow: 'Why partner',
      title: 'What partnership unlocks',
      description: 'Tangible value for your organisation and the wider ecosystem.',
      features: [
        {
          icon: 'users',
          title: 'A direct talent pipeline',
          description: 'Meet, mentor and evaluate the engineers and founders of tomorrow.',
        },
        {
          icon: 'lightbulb',
          title: 'Fresh innovation capacity',
          description: 'Get motivated teams exploring problems your roadmap has not reached yet.',
        },
        {
          icon: 'globe',
          title: 'Regional impact & visibility',
          description: 'Back the local economy and build your brand among emerging tech leaders.',
        },
      ],
    },
    ways: {
      eyebrow: 'Ways to engage',
      title: 'Choose how you contribute',
      description:
        'There are multiple ways to get involved, from a single challenge to deep support.',
      features: [
        {
          icon: 'building',
          title: 'Define a challenge',
          description:
            'Submit a real problem to Program B and work with student teams on a solution.',
        },
        {
          icon: 'trending',
          title: 'Sponsor & fund',
          description: 'Support seed funding, rewards and infrastructure that power the programs.',
        },
        {
          icon: 'mentor',
          title: 'Mentor a team',
          description: 'Share your expertise one-on-one and help founders avoid costly mistakes.',
        },
        {
          icon: 'flask',
          title: 'Provide resources',
          description: 'Offer tooling, labs or workspaces that help teams move faster.',
        },
        {
          icon: 'graduation',
          title: 'Collaborate on research',
          description: 'Bridge academic research and market application with joint initiatives.',
        },
        {
          icon: 'handshake',
          title: 'Open career paths',
          description: 'Offer internships and roles to keep great talent in the region.',
        },
      ],
    },
    logos: {
      label: 'Trusted by partners across the ecosystem',
      items: ['TECHCORP', 'UNIDATA', 'NITRA_LAB', 'EUTECH', 'DEEPGRID'],
    },
    cta: {
      title: 'Let’s build the regional innovation economy together',
      description: 'Register as a company to define challenges, mentor teams and partner with NTI.',
      actions: [
        { label: 'Become a partner', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
        { label: 'About NTI', href: ROUTES.ABOUT, variant: 'secondary' },
      ],
    },
  },
  sk: {
    metaTitle: 'Partneri',
    hero: {
      eyebrow: 'Pre partnerov',
      title: 'Spojte sa s ďalšou generáciou tvorcov',
      description:
        'Firmy, univerzity a investori formujú ekosystém NTI. Staňte sa partnerom a získajte prístup k novému talentu, spoluvytvárajte prelomové riešenia a posilnite regionálnu inovačnú ekonomiku.',
      actions: [
        { label: 'Stať sa partnerom', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
        { label: 'Preskúmať programy', href: ROUTES.programs('b'), variant: 'secondary' },
      ],
    },
    why: {
      eyebrow: 'Prečo partnerstvo',
      title: 'Čo partnerstvo prináša',
      description: 'Konkrétna hodnota pre vašu organizáciu aj pre celý ekosystém.',
      features: [
        {
          icon: 'users',
          title: 'Priamy zdroj talentu',
          description: 'Spoznávajte, mentorujte a hodnoťte inžinierov a zakladateľov budúcnosti.',
        },
        {
          icon: 'lightbulb',
          title: 'Nová inovačná kapacita',
          description: 'Získajte motivované tímy na problémy, ku ktorým sa váš plán ešte nedostal.',
        },
        {
          icon: 'globe',
          title: 'Regionálny dopad a viditeľnosť',
          description: 'Podporte lokálnu ekonomiku a budujte značku medzi vznikajúcimi lídrami.',
        },
      ],
    },
    ways: {
      eyebrow: 'Možnosti zapojenia',
      title: 'Vyberte si, ako prispejete',
      description: 'Zapojiť sa môžete viacerými spôsobmi — od jednej výzvy po hĺbkovú podporu.',
      features: [
        {
          icon: 'building',
          title: 'Definujte výzvu',
          description: 'Pridajte reálny problém do Programu B a riešte ho so študentskými tímami.',
        },
        {
          icon: 'trending',
          title: 'Sponzorstvo a financovanie',
          description: 'Podporte seed financovanie, odmeny a zázemie, ktoré poháňajú programy.',
        },
        {
          icon: 'mentor',
          title: 'Mentorujte tím',
          description: 'Zdieľajte expertízu individuálne a pomôžte zakladateľom vyhnúť sa chybám.',
        },
        {
          icon: 'flask',
          title: 'Poskytnite zdroje',
          description:
            'Ponúknite nástroje, laboratóriá či priestory, ktoré tímom pomôžu napredovať.',
        },
        {
          icon: 'graduation',
          title: 'Spolupracujte na výskume',
          description: 'Prepájajte akademický výskum s trhom prostredníctvom spoločných iniciatív.',
        },
        {
          icon: 'handshake',
          title: 'Otvorte kariérne cesty',
          description: 'Ponúknite stáže a pozície, aby skvelý talent zostal v regióne.',
        },
      ],
    },
    logos: {
      label: 'Dôverujú nám partneri z celého ekosystému',
      items: ['TECHCORP', 'UNIDATA', 'NITRA_LAB', 'EUTECH', 'DEEPGRID'],
    },
    cta: {
      title: 'Budujme regionálnu inovačnú ekonomiku spoločne',
      description:
        'Zaregistrujte sa ako firma, definujte výzvy, mentorujte tímy a spojte sa s NTI.',
      actions: [
        { label: 'Stať sa partnerom', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
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

export default async function PartnersPage() {
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

      <CTASection title={c.cta.title} description={c.cta.description} actions={c.cta.actions} />
    </MarketingPageShell>
  );
}
