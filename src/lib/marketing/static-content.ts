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
