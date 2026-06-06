import type { Metadata } from 'next';

import { MarketingPageShell, ProgramsExplorer, type ProgramView } from 'components/marketing';
import { ROUTES } from 'lib/constants';
import { type AppLocale } from 'lib/i18n/config';
import { getRequestLocale } from 'lib/i18n/server-locale';

type ProgramsContent = {
  metaTitle: string;
  heading: { eyebrow: string; title: string; description: string };
  programA: ProgramView;
  programB: ProgramView;
};

const PROGRAM_A_IMAGE = {
  url: '/images/business-ideas.png',
  alt: 'Founders shaping a product idea',
};
const PROGRAM_B_IMAGE = {
  url: '/images/students-working.png',
  alt: 'A student team working together',
};

const content: Record<AppLocale, ProgramsContent> = {
  en: {
    metaTitle: 'Programs',
    heading: {
      eyebrow: 'Two paths, one ecosystem',
      title: 'Explore our programs',
      description:
        'Whether you are building your own venture or solving real industry challenges, switch between the two tracks to find the right fit.',
    },
    programA: {
      key: 'a',
      tabLabel: 'Program A · Venture Launch',
      hero: {
        eyebrow: 'Program A · Venture Launch',
        title: 'From prototype to a market-ready company',
        description:
          'Program A is for founders with their own product idea. We provide seed funding, dedicated mentoring and lab infrastructure to turn your prototype into a high-performance startup.',
        actions: [
          {
            label: 'Apply as student / team',
            href: ROUTES.AUTH.REGISTER_STUDENT,
            variant: 'primary',
          },
        ],
        image: PROGRAM_A_IMAGE,
      },
      sections: [
        {
          eyebrow: 'What you get',
          title: 'Everything you need to launch',
          description:
            'A complete support stack designed to remove the obstacles between a great idea and a real company.',
          features: [
            {
              icon: 'trending',
              title: 'Seed funding access',
              description:
                'Early capital and grant support to validate and build without distraction.',
            },
            {
              icon: 'mentor',
              title: '1-on-1 mentoring',
              description:
                'Hands-on guidance from operators who have built and scaled technology companies.',
            },
            {
              icon: 'flask',
              title: 'Specialized lab infrastructure',
              description:
                'Prototyping labs, premium workspaces and the tooling to move fast on hardware and software.',
            },
            {
              icon: 'badge',
              title: 'Structured evaluation',
              description:
                'Clear milestones and expert review so you always know what to prove next.',
            },
            {
              icon: 'handshake',
              title: 'Legal & operational support',
              description:
                'Help with incorporation, contracts and the groundwork of running a company.',
            },
            {
              icon: 'globe',
              title: 'Investor & partner network',
              description:
                'Warm introductions to the regional and European ecosystem when you are ready.',
            },
          ],
        },
      ],
      steps: {
        eyebrow: 'How it works',
        title: 'Your path through Program A',
        items: [
          {
            title: 'Apply',
            description: 'Submit your idea, team and the problem you are solving.',
          },
          {
            title: 'Evaluate',
            description: 'Our commission reviews and scores applications against clear criteria.',
          },
          {
            title: 'Onboard',
            description: 'Approved teams get funding, a mentor and access to infrastructure.',
          },
          {
            title: 'Build & scale',
            description: 'Hit milestones with support until you are ready for the market.',
          },
        ],
      },
      cta: {
        title: 'Have a product idea worth building?',
        description:
          'Apply to Program A and turn your prototype into a company with NTI behind you.',
        actions: [
          { label: 'Apply as student', href: ROUTES.AUTH.REGISTER_STUDENT, variant: 'primary' },
          { label: 'See Program B', href: ROUTES.programs('b'), variant: 'secondary' },
        ],
      },
    },
    programB: {
      key: 'b',
      tabLabel: 'Program B · Industry Bridge',
      hero: {
        eyebrow: 'Program B · Industry Bridge',
        title: 'Solve real corporate challenges, build real experience',
        description:
          'Program B connects student teams with companies to deliver breakthrough solutions. Students gain professional practice; companies tap into fresh talent and ideas.',
        actions: [
          {
            label: 'Apply as student / team',
            href: ROUTES.AUTH.REGISTER_STUDENT,
            variant: 'primary',
          },
          { label: 'Submit a challenge', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'secondary' },
        ],
        image: PROGRAM_B_IMAGE,
      },
      sections: [
        {
          eyebrow: 'For students & teams',
          title: 'Work on problems that matter',
          description:
            'Build a portfolio on real briefs, mentored by industry and supported by NTI.',
          features: [
            {
              icon: 'briefcase',
              title: 'Real-world corporate practice',
              description: 'Tackle live challenges defined by companies, not classroom exercises.',
            },
            {
              icon: 'mentor',
              title: 'Mentoring & product ownership',
              description: 'A product owner and mentors guide your team from backlog to delivery.',
            },
            {
              icon: 'trophy',
              title: 'Recognition & rewards',
              description:
                'Earn rewards for delivered milestones and stand out to future employers.',
            },
          ],
        },
        {
          eyebrow: 'For companies',
          title: 'Access fresh talent and ideas',
          description:
            'Define a challenge, shape the backlog and work with motivated student teams.',
          features: [
            {
              icon: 'lightbulb',
              title: 'Breakthrough solutions',
              description:
                'Get new perspectives on problems your team has not had time to explore.',
            },
            {
              icon: 'users',
              title: 'A talent pipeline',
              description: 'Meet and evaluate the next generation of engineers and builders.',
            },
            {
              icon: 'handshake',
              title: 'Structured collaboration',
              description:
                'NTI handles the process — backlog, milestones and delivery — so you can focus.',
            },
          ],
        },
      ],
      steps: {
        eyebrow: 'How it works',
        title: 'From challenge to delivery',
        items: [
          { title: 'Define', description: 'A company submits a challenge and shapes the backlog.' },
          {
            title: 'Assemble',
            description: 'Student teams apply and a product owner is assigned.',
          },
          { title: 'Build', description: 'Teams deliver against milestones with mentor support.' },
          { title: 'Reward', description: 'Completed work is recognised and rewarded.' },
        ],
      },
      cta: {
        title: 'Bring a challenge — or take one on',
        description:
          'Companies define the problem, student teams build the solution. Start with NTI today.',
        actions: [
          { label: 'Submit a challenge', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
          { label: 'See Program A', href: ROUTES.programs('a'), variant: 'secondary' },
        ],
      },
    },
  },
  sk: {
    metaTitle: 'Programy',
    heading: {
      eyebrow: 'Dve cesty, jeden ekosystém',
      title: 'Spoznajte naše programy',
      description:
        'Či už budujete vlastný startup alebo riešite skutočné firemné výzvy, prepínajte medzi oboma cestami a nájdite tú správnu.',
    },
    programA: {
      key: 'a',
      tabLabel: 'Program A · Rozbeh startupu',
      hero: {
        eyebrow: 'Program A · Rozbeh startupu',
        title: 'Od prototypu k firme pripravenej na trh',
        description:
          'Program A je pre zakladateľov s vlastným produktovým nápadom. Poskytujeme seed financovanie, individuálne mentorstvo a laboratórne zázemie, aby sa z vášho prototypu stal výkonný startup.',
        actions: [
          {
            label: 'Prihlásiť sa ako študent / tím',
            href: ROUTES.AUTH.REGISTER_STUDENT,
            variant: 'primary',
          },
        ],
        image: PROGRAM_A_IMAGE,
      },
      sections: [
        {
          eyebrow: 'Čo získate',
          title: 'Všetko, čo potrebujete na rozbeh',
          description:
            'Kompletná podpora navrhnutá tak, aby odstránila prekážky medzi skvelým nápadom a skutočnou firmou.',
          features: [
            {
              icon: 'trending',
              title: 'Prístup k seed financovaniu',
              description:
                'Počiatočný kapitál a grantová podpora na overenie a tvorbu bez rozptyľovania.',
            },
            {
              icon: 'mentor',
              title: 'Individuálne mentorstvo',
              description:
                'Praktické vedenie od ľudí, ktorí budovali a škálovali technologické firmy.',
            },
            {
              icon: 'flask',
              title: 'Špecializované laboratórne zázemie',
              description:
                'Prototypovacie laboratóriá, moderné priestory a nástroje na rýchly postup v hardvéri aj softvéri.',
            },
            {
              icon: 'badge',
              title: 'Štruktúrované hodnotenie',
              description:
                'Jasné míľniky a expertné posúdenie, aby ste vždy vedeli, čo dokázať ďalej.',
            },
            {
              icon: 'handshake',
              title: 'Právna a prevádzková podpora',
              description: 'Pomoc so založením firmy, zmluvami a základmi fungovania spoločnosti.',
            },
            {
              icon: 'globe',
              title: 'Sieť investorov a partnerov',
              description:
                'Odporúčania do regionálneho a európskeho ekosystému, keď budete pripravení.',
            },
          ],
        },
      ],
      steps: {
        eyebrow: 'Ako to funguje',
        title: 'Vaša cesta Programom A',
        items: [
          { title: 'Prihláste sa', description: 'Predstavte nápad, tím a problém, ktorý riešite.' },
          {
            title: 'Hodnotenie',
            description: 'Naša komisia posúdi a oboduje prihlášky podľa jasných kritérií.',
          },
          {
            title: 'Onboarding',
            description: 'Schválené tímy získajú financovanie, mentora a prístup k zázemiu.',
          },
          {
            title: 'Tvorba a rast',
            description: 'Plňte míľniky s podporou, až kým nebudete pripravení na trh.',
          },
        ],
      },
      cta: {
        title: 'Máte produktový nápad, ktorý stojí za to postaviť?',
        description:
          'Prihláste sa do Programu A a premeňte svoj prototyp na firmu s NTI po vašom boku.',
        actions: [
          {
            label: 'Prihlásiť sa ako študent',
            href: ROUTES.AUTH.REGISTER_STUDENT,
            variant: 'primary',
          },
          { label: 'Pozrieť Program B', href: ROUTES.programs('b'), variant: 'secondary' },
        ],
      },
    },
    programB: {
      key: 'b',
      tabLabel: 'Program B · Prepojenie s priemyslom',
      hero: {
        eyebrow: 'Program B · Prepojenie s priemyslom',
        title: 'Riešte skutočné firemné výzvy, získajte skutočnú prax',
        description:
          'Program B prepája študentské tímy s firmami pri tvorbe riešení s reálnym dopadom. Študenti získajú odbornú prax, firmy prístup k novému talentu a nápadom.',
        actions: [
          {
            label: 'Prihlásiť sa ako študent / tím',
            href: ROUTES.AUTH.REGISTER_STUDENT,
            variant: 'primary',
          },
          { label: 'Pridať výzvu', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'secondary' },
        ],
        image: PROGRAM_B_IMAGE,
      },
      sections: [
        {
          eyebrow: 'Pre študentov a tímy',
          title: 'Pracujte na tom, na čom záleží',
          description:
            'Budujte portfólio na reálnych zadaniach pod vedením priemyslu a s podporou NTI.',
          features: [
            {
              icon: 'briefcase',
              title: 'Reálna firemná prax',
              description: 'Riešte živé výzvy definované firmami, nie cvičenia z učebne.',
            },
            {
              icon: 'mentor',
              title: 'Mentoring a vlastníctvo produktu',
              description: 'Product owner a mentori vedú váš tím od backlogu po dodanie.',
            },
            {
              icon: 'trophy',
              title: 'Uznanie a odmeny',
              description:
                'Získajte odmeny za splnené míľniky a vyniknite pred budúcimi zamestnávateľmi.',
            },
          ],
        },
        {
          eyebrow: 'Pre firmy',
          title: 'Získajte nový talent a nápady',
          description: 'Definujte výzvu, formujte backlog a spolupracujte s motivovanými tímami.',
          features: [
            {
              icon: 'lightbulb',
              title: 'Prelomové riešenia',
              description: 'Získajte nové pohľady na problémy, na ktoré váš tím nemal čas.',
            },
            {
              icon: 'users',
              title: 'Zdroj talentu',
              description: 'Spoznajte a ohodnoťte ďalšiu generáciu inžinierov a tvorcov.',
            },
            {
              icon: 'handshake',
              title: 'Štruktúrovaná spolupráca',
              description:
                'NTI sa stará o proces — backlog, míľniky a dodanie — vy sa môžete sústrediť.',
            },
          ],
        },
      ],
      steps: {
        eyebrow: 'Ako to funguje',
        title: 'Od výzvy k dodaniu',
        items: [
          { title: 'Definícia', description: 'Firma pridá výzvu a sformuje backlog.' },
          {
            title: 'Zostavenie',
            description: 'Študentské tímy sa prihlásia a priradí sa product owner.',
          },
          { title: 'Tvorba', description: 'Tímy plnia míľniky s podporou mentorov.' },
          { title: 'Odmena', description: 'Dokončená práca je uznaná a odmenená.' },
        ],
      },
      cta: {
        title: 'Prineste výzvu — alebo ju prijmite',
        description:
          'Firmy definujú problém, študentské tímy tvoria riešenie. Začnite s NTI ešte dnes.',
        actions: [
          { label: 'Pridať výzvu', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
          { label: 'Pozrieť Program A', href: ROUTES.programs('a'), variant: 'secondary' },
        ],
      },
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = content[locale];

  return { title: `${c.metaTitle} — NTI`, description: c.heading.description };
}

export default async function ProgramsPage() {
  const locale = await getRequestLocale();
  const c = content[locale];

  return (
    <MarketingPageShell>
      <ProgramsExplorer heading={c.heading} programs={[c.programA, c.programB]} />
    </MarketingPageShell>
  );
}
