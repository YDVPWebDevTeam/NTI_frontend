import type { MarketingAction } from 'components/marketing';
import { ROUTES } from 'lib/constants';
import type { AppLocale } from 'lib/i18n/config';

/**
 * Static navigation + SEO for the marketing pages. CTA buttons and page titles
 * are fixed structure (routes never change for an editor), so they live in code
 * — keyed by locale, the same way these server components already localize —
 * rather than in the CMS. The CMS owns the prose; this owns the links.
 */

/** A plain link used by landing-page CTAs (which render bespoke button styles). */
export type StaticCta = { href: string; label: string };

type WithActions = {
  metaTitle: string;
  heroActions: MarketingAction[];
  ctaActions: MarketingAction[];
};

export const partnersStatic: Record<AppLocale, WithActions> = {
  en: {
    metaTitle: 'Partners',
    heroActions: [
      { label: 'Become a partner', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
      { label: 'Explore Programs', href: ROUTES.programs('b'), variant: 'secondary' },
    ],
    ctaActions: [
      { label: 'Become a partner', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
      { label: 'About NTI', href: ROUTES.ABOUT, variant: 'secondary' },
    ],
  },
  sk: {
    metaTitle: 'Partneri',
    heroActions: [
      { label: 'Stať sa partnerom', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
      { label: 'Preskúmať programy', href: ROUTES.programs('b'), variant: 'secondary' },
    ],
    ctaActions: [
      { label: 'Stať sa partnerom', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'primary' },
      { label: 'O NTI', href: ROUTES.ABOUT, variant: 'secondary' },
    ],
  },
};

export const aboutStatic: Record<AppLocale, WithActions> = {
  en: {
    metaTitle: 'About NTI',
    heroActions: [],
    ctaActions: [
      { label: 'Apply as student', href: ROUTES.AUTH.REGISTER_STUDENT, variant: 'primary' },
      { label: 'Submit a challenge', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'secondary' },
    ],
  },
  sk: {
    metaTitle: 'O NTI',
    heroActions: [],
    ctaActions: [
      { label: 'Prihlásiť sa ako študent', href: ROUTES.AUTH.REGISTER_STUDENT, variant: 'primary' },
      { label: 'Pridať výzvu', href: ROUTES.AUTH.REGISTER_COMPANY, variant: 'secondary' },
    ],
  },
};

export const mentorsStatic: Record<AppLocale, WithActions> = {
  en: {
    metaTitle: 'Mentors',
    heroActions: [
      { label: 'Become a mentor', href: ROUTES.contact('mentor'), variant: 'primary' },
      { label: 'Explore the programs', href: ROUTES.PROGRAMS, variant: 'secondary' },
    ],
    ctaActions: [
      { label: 'Become a mentor', href: ROUTES.contact('mentor'), variant: 'primary' },
      { label: 'About NTI', href: ROUTES.ABOUT, variant: 'secondary' },
    ],
  },
  sk: {
    metaTitle: 'Mentori',
    heroActions: [
      { label: 'Stať sa mentorom', href: ROUTES.contact('mentor'), variant: 'primary' },
      { label: 'Preskúmať programy', href: ROUTES.PROGRAMS, variant: 'secondary' },
    ],
    ctaActions: [
      { label: 'Stať sa mentorom', href: ROUTES.contact('mentor'), variant: 'primary' },
      { label: 'O NTI', href: ROUTES.ABOUT, variant: 'secondary' },
    ],
  },
};

type LandingCtas = {
  heroPrimary: StaticCta;
  heroSecondary: StaticCta;
  heroLearnMore: StaticCta;
  /** One CTA per program card, by index (Program A, Program B). */
  programCtas: [StaticCta, StaticCta];
  finalPrimary: StaticCta;
  finalSecondary: StaticCta;
};

/**
 * Static fallback *copy* for the landing page, used only when the CMS returns
 * empty text (unconfigured / unreachable) so the page never renders blank
 * headings or empty sections. The CMS remains the source of truth when present.
 */
type LandingFallbackCopy = {
  hero: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
  };
  programsHeading: string;
  infrastructure: { eyebrow: string; heading: string };
  ecosystem: { heading: string; description: string };
  finalCTA: { title: string; description: string };
};

export const landingFallback: Record<AppLocale, LandingFallbackCopy> = {
  en: {
    hero: {
      eyebrow: 'National Technology Initiative',
      titlePrefix: 'Build the',
      titleHighlight: 'next generation',
      titleSuffix: 'of technology together',
      description:
        'NTI connects students, companies, and mentors to turn bold ideas into real ventures and solve industry challenges.',
    },
    programsHeading: 'Our Programs',
    infrastructure: { eyebrow: 'Why NTI', heading: 'Everything you need to build' },
    ecosystem: {
      heading: 'A growing ecosystem',
      description: 'Founders, mentors, and partners working side by side.',
    },
    finalCTA: {
      title: 'Ready to get started?',
      description: 'Join NTI as a student or partner and start building today.',
    },
  },
  sk: {
    hero: {
      eyebrow: 'Národná technologická iniciatíva',
      titlePrefix: 'Budujme',
      titleHighlight: 'novú generáciu',
      titleSuffix: 'technológií spoločne',
      description:
        'NTI spája študentov, firmy a mentorov, aby premenili odvážne nápady na reálne projekty a riešili výzvy odvetvia.',
    },
    programsHeading: 'Naše programy',
    infrastructure: { eyebrow: 'Prečo NTI', heading: 'Všetko, čo potrebujete na budovanie' },
    ecosystem: {
      heading: 'Rastúci ekosystém',
      description: 'Zakladatelia, mentori a partneri pracujúci bok po boku.',
    },
    finalCTA: {
      title: 'Pripravení začať?',
      description: 'Pridajte sa k NTI ako študent alebo partner a začnite budovať ešte dnes.',
    },
  },
};

export const landingStatic: Record<AppLocale, LandingCtas> = {
  en: {
    heroPrimary: { href: ROUTES.AUTH.REGISTER_STUDENT, label: 'Apply as student/team' },
    heroSecondary: { href: ROUTES.AUTH.REGISTER_COMPANY, label: 'Submit a challenge' },
    heroLearnMore: { href: ROUTES.HOME.PROGRAMS, label: 'Learn more about NTI' },
    programCtas: [
      { href: ROUTES.AUTH.REGISTER_STUDENT, label: 'Launch Startup' },
      { href: ROUTES.AUTH.REGISTER_COMPANY, label: 'Explore Challenges' },
    ],
    finalPrimary: { href: ROUTES.AUTH.REGISTER_STUDENT, label: 'Apply as Student' },
    finalSecondary: { href: ROUTES.AUTH.REGISTER_COMPANY, label: 'Submit Challenge' },
  },
  sk: {
    heroPrimary: { href: ROUTES.AUTH.REGISTER_STUDENT, label: 'Prihlásiť sa ako študent/tím' },
    heroSecondary: { href: ROUTES.AUTH.REGISTER_COMPANY, label: 'Pridať výzvu' },
    heroLearnMore: { href: ROUTES.HOME.PROGRAMS, label: 'Zistiť viac o NTI' },
    programCtas: [
      { href: ROUTES.AUTH.REGISTER_STUDENT, label: 'Spustiť startup' },
      { href: ROUTES.AUTH.REGISTER_COMPANY, label: 'Preskúmať výzvy' },
    ],
    finalPrimary: { href: ROUTES.AUTH.REGISTER_STUDENT, label: 'Prihlásiť sa ako študent' },
    finalSecondary: { href: ROUTES.AUTH.REGISTER_COMPANY, label: 'Pridať výzvu' },
  },
};
