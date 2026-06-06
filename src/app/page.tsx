import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FlaskConical,
  Rocket,
  Sparkles,
  UserRoundCog,
  Users,
} from 'lucide-react';

import { Reveal, ScrollProgress } from 'components/landing';
import { LandingAuthActions, LandingFooter, LandingHeader } from 'components/layout';
import { fetchLandingPageContent, type LandingPageContent } from 'lib/cms/landing-page';
import { getRequestLocale } from 'lib/i18n/server-locale';

/** Per-item delay (ms) for staggered scroll-reveal animations. */
const STAGGER_MS = 120;

/** How many times the partner logo set repeats per marquee group. */
const MARQUEE_REPEAT = 4;

type IconProps = {
  className?: string;
};

function getIcon(icon: string, className?: string) {
  const props: IconProps = {
    className,
  };

  switch (icon) {
    case 'badge':
      return <BadgeCheck {...props} />;

    case 'building':
      return <Building2 {...props} />;

    case 'flask':
      return <FlaskConical {...props} />;

    case 'mentor':
      return <UserRoundCog {...props} />;

    case 'rocket':
      return <Rocket {...props} />;

    case 'users':
      return <Users {...props} />;

    default:
      return <BadgeCheck {...props} />;
  }
}

function toneClasses(tone: LandingPageContent['infrastructure']['cards'][number]['tone']) {
  switch (tone) {
    case 'primary':
      return {
        body: 'bg-primary text-white',
        copy: 'text-blue-100',
      };

    case 'tertiary':
      return {
        body: 'bg-tertiary text-white',
        copy: 'text-cyan-100',
      };

    default:
      return {
        body: 'bg-surface-container-high',
        copy: 'text-on-surface-variant',
      };
  }
}

function accentClasses(accent: LandingPageContent['programs']['items'][number]['accent']) {
  if (accent === 'tertiary') {
    return {
      bar: 'from-tertiary to-tertiary-fixed-dim',
      button: 'border-tertiary text-tertiary hover:bg-tertiary hover:text-white',
      card: 'hover:border-tertiary/40',
      glow: 'bg-tertiary-fixed-dim/20',
      icon: 'text-tertiary bg-tertiary/10',
    };
  }

  return {
    bar: 'from-primary to-primary-container',
    button: 'border-primary text-primary hover:bg-primary hover:text-white',
    card: 'hover:border-primary/40',
    glow: 'bg-primary-fixed-dim/30',
    icon: 'text-primary bg-primary/10',
  };
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const content = await fetchLandingPageContent(locale);

  // Repeat the logos enough to overflow the viewport, then render the group
  // twice so the -50% translate produces a seamless, gapless loop.
  const marqueeGroup = Array.from({ length: MARQUEE_REPEAT }).flatMap(
    () => content.ecosystem.partnerLogos,
  );

  return (
    <div className="bg-surface font-body text-on-surface overflow-x-hidden antialiased">
      <ScrollProgress />
      <LandingHeader />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section
        className="bg-surface relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32"
        id="about"
      >
        {/* animated backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0" />
          <div className="bg-primary-fixed-dim/30 animate-blob absolute -top-24 -right-16 h-[28rem] w-[28rem] rounded-full blur-3xl" />
          <div className="bg-tertiary-fixed-dim/20 animate-blob absolute top-40 -left-24 h-96 w-96 rounded-full blur-3xl [animation-delay:-6s]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <Reveal className="space-y-8 lg:col-span-7">
              <span className="border-tertiary/30 bg-tertiary-fixed/60 text-on-tertiary-fixed inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-widest uppercase backdrop-blur">
                <span className="bg-tertiary-fixed-dim pulse-dot inline-block h-2 w-2 rounded-full" />
                {content.hero.eyebrow}
              </span>
              <h1 className="font-headline text-on-surface text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
                {content.hero.titlePrefix}{' '}
                <span className="text-gradient">{content.hero.titleHighlight}</span>{' '}
                {content.hero.titleSuffix}
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed md:text-xl">
                {content.hero.description}
              </p>
              <LandingAuthActions
                className="flex flex-col gap-4 pt-4 sm:flex-row"
                authenticatedClassName="primary-gradient group inline-flex items-center justify-center gap-2 w-full rounded-xl px-8 py-4 text-center font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                unauthenticatedActions={[
                  {
                    className:
                      'primary-gradient group inline-flex items-center justify-center gap-2 w-full rounded-xl px-8 py-4 text-center font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 sm:w-auto',
                    href: content.hero.primaryCTA.href,
                    label: content.hero.primaryCTA.label,
                  },
                  {
                    className:
                      'bg-surface-container-highest text-primary hover:bg-surface-container-high w-full rounded-xl px-8 py-4 text-center font-bold ring-1 ring-primary/10 transition-all hover:-translate-y-0.5 sm:w-auto',
                    href: content.hero.secondaryCTA.href,
                    label: content.hero.secondaryCTA.label,
                  },
                ]}
              />
              <Link
                className="text-primary group inline-flex items-center gap-2 font-bold"
                href={content.hero.learnMoreCTA.href}
              >
                {content.hero.learnMoreCTA.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <Reveal className="relative mt-10 lg:col-span-5 lg:mt-0" delay={150}>
              <div className="bg-primary-container/10 absolute -top-12 -right-12 aspect-square h-64 w-64 rounded-full blur-3xl md:h-96 md:w-96" />
              <div className="animate-float-slow shadow-primary/15 relative mx-auto aspect-square w-full overflow-hidden rounded-3xl border-4 border-white/60 shadow-2xl sm:w-4/5 lg:w-full">
                <Image
                  fill
                  alt={content.hero.heroImage.alt}
                  className="object-cover"
                  src={content.hero.heroImage.url}
                  unoptimized
                />
                <div className="from-primary/30 absolute inset-0 bg-gradient-to-t to-transparent" />
              </div>
              {/* floating success chip */}
              <div className="bg-surface-container-lowest animate-float shadow-primary/10 absolute -bottom-5 -left-2 flex max-w-[15rem] items-center gap-3 rounded-2xl border border-white/60 p-4 shadow-xl backdrop-blur sm:-left-6">
                <span className="bg-tertiary/10 text-tertiary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <BadgeCheck className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-on-surface-variant text-[0.65rem] font-bold tracking-widest uppercase">
                    {content.ecosystem.successHighlight.eyebrow}
                  </p>
                  <p className="text-on-surface truncate text-sm font-bold">
                    {content.ecosystem.successHighlight.metric}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Partner marquee ──────────────────────────────────── */}
      <section className="bg-surface-container-low/60 border-outline-variant/20 border-y py-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-on-surface-variant/70 mb-6 text-center text-xs font-bold tracking-[0.2em] uppercase">
            {content.ecosystem.heading}
          </p>
          <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
            <div className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]">
              {[0, 1].map((group) => (
                <div
                  key={group}
                  aria-hidden={group === 1}
                  className="flex shrink-0 items-center gap-16 pr-16"
                >
                  {marqueeGroup.map((partner, index) => (
                    <span
                      key={`${group}-${partner}-${index}`}
                      className="text-on-surface-variant/40 hover:text-on-surface-variant/80 text-2xl font-black tracking-tighter whitespace-nowrap transition-colors"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Programs ─────────────────────────────────────────── */}
      <section className="bg-surface-container-low relative py-24" id="programs">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-16 text-center lg:text-left">
            <h2 className="font-headline mb-4 text-4xl font-bold">{content.programs.heading}</h2>
            <div className="bg-tertiary-fixed-dim h-1.5 w-20 rounded-full max-lg:mx-auto" />
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2">
            {content.programs.items.map((program, index) => {
              const accent = accentClasses(program.accent);

              return (
                <Reveal key={program.title} delay={index * STAGGER_MS}>
                  <div
                    className={`group bg-surface-container-lowest hover:shadow-primary/10 relative h-full overflow-hidden rounded-2xl border border-transparent p-10 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${accent.card}`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent.bar}`}
                    />
                    <div
                      className={`absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`}
                    />
                    <div className="relative">
                      <div className="mb-8 flex items-center justify-between">
                        {getIcon(
                          program.icon,
                          `${accent.icon} h-16 w-16 rounded-2xl p-3.5 transition-transform duration-300 group-hover:scale-110`,
                        )}
                        <span className="text-surface-container-high font-headline text-6xl font-black select-none">
                          0{index + 1}
                        </span>
                      </div>
                      <h3 className="font-headline mb-4 text-2xl font-extrabold">
                        {program.title}
                      </h3>
                      <p className="text-on-surface-variant mb-8 leading-relaxed">
                        {program.description}
                      </p>
                      <ul className="mb-10 space-y-4">
                        {program.bulletItems.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-3 text-sm font-medium">
                            <CheckCircle2 className="text-tertiary h-5 w-5 shrink-0" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={program.cta.href}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 py-4 text-center font-bold transition-all ${accent.button}`}
                      >
                        {program.cta.label}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Infrastructure / Why NTI ─────────────────────────── */}
      <section className="bg-surface py-24" id="infrastructure">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-16 text-center">
            <p className="text-tertiary mb-2 text-xs font-bold tracking-widest uppercase">
              {content.infrastructure.eyebrow}
            </p>
            <h2 className="font-headline text-4xl font-bold">{content.infrastructure.heading}</h2>
          </Reveal>
          <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
            <Reveal className="md:col-span-2 md:row-span-2">
              <div className="bg-surface-container group relative flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-2xl p-8 ring-1 ring-black/5">
                <div className="absolute inset-0 opacity-10 transition-all duration-500 group-hover:scale-105 group-hover:opacity-20">
                  <Image
                    fill
                    alt={content.infrastructure.featuredCard.image.alt}
                    className="object-cover"
                    src={content.infrastructure.featuredCard.image.url}
                    unoptimized
                  />
                </div>
                <div className="relative z-10">
                  {getIcon(content.infrastructure.featuredCard.icon, 'text-primary mb-4 h-8 w-8')}
                  <h4 className="mb-2 text-2xl font-bold">
                    {content.infrastructure.featuredCard.title}
                  </h4>
                  <p className="text-on-surface-variant">
                    {content.infrastructure.featuredCard.description}
                  </p>
                </div>
              </div>
            </Reveal>

            {content.infrastructure.cards.map((card, index) => {
              const tone = toneClasses(card.tone);
              const wide = index === 0;

              return (
                <Reveal
                  key={card.title}
                  className={wide ? 'md:col-span-2' : ''}
                  delay={index * STAGGER_MS}
                >
                  <div
                    className={`${tone.body} group h-full rounded-2xl p-8 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${wide ? 'flex items-center gap-6' : 'flex flex-col justify-between'}`}
                  >
                    {getIcon(
                      card.icon,
                      `${wide ? 'h-10 w-10' : 'h-8 w-8'} transition-transform duration-300 group-hover:scale-110 ${card.tone === 'surface' ? 'text-tertiary' : ''}`,
                    )}
                    <div>
                      <h4 className="mb-1 text-xl font-bold">{card.title}</h4>
                      <p className={`${tone.copy} text-sm`}>{card.description}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Ecosystem / Mentors ──────────────────────────────── */}
      <section className="bg-surface-container-low overflow-hidden py-24" id="mentors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-3">
            <Reveal>
              <h2 className="font-headline mb-6 text-center text-3xl font-bold lg:text-left">
                {content.ecosystem.heading}
              </h2>
              <p className="text-on-surface-variant mb-8 text-center lg:text-left">
                {content.ecosystem.description}
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-40 lg:justify-start">
                {content.ecosystem.partnerLogos.map((partner) => (
                  <div key={partner} className="text-2xl font-black tracking-tighter">
                    {partner}
                  </div>
                ))}
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:col-span-2">
              {content.ecosystem.mentors.map((mentor, index) => (
                <Reveal key={mentor.name} delay={index * STAGGER_MS}>
                  <div className="group bg-surface-container-lowest border-outline-variant/20 hover:shadow-primary/5 flex h-full gap-4 rounded-2xl border-b-2 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="ring-tertiary/20 group-hover:ring-tertiary/50 relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 transition-all">
                      <Image
                        fill
                        alt={mentor.image.alt}
                        className="object-cover"
                        src={mentor.image.url}
                        unoptimized
                      />
                    </div>
                    <div>
                      <h5 className="font-bold">{mentor.name}</h5>
                      <p className="text-tertiary mb-2 text-xs font-bold">{mentor.role}</p>
                      <p className="text-on-surface-variant text-xs">{mentor.bio}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
              <Reveal className="md:col-span-2" delay={120}>
                <div className="bg-primary-container relative flex items-center justify-between overflow-hidden rounded-2xl p-6 text-white">
                  <div className="animate-blob absolute -top-10 -right-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative flex items-center gap-4">
                    <BadgeCheck className="h-10 w-10 opacity-50" />
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase opacity-70">
                        {content.ecosystem.successHighlight.eyebrow}
                      </p>
                      <h5 className="text-xl font-bold">
                        {content.ecosystem.successHighlight.title}
                      </h5>
                    </div>
                  </div>
                  <div className="relative hidden text-right sm:block">
                    <p className="text-sm font-medium">
                      {content.ecosystem.successHighlight.metric}
                    </p>
                    <p className="text-xs opacity-70">
                      {content.ecosystem.successHighlight.subtext}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="primary-gradient shadow-primary/20 relative overflow-hidden rounded-3xl p-12 text-center text-white shadow-2xl md:p-20">
              <div className="animate-blob absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
              <div className="animate-blob bg-tertiary-fixed-dim/20 absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full blur-3xl [animation-delay:-8s]" />
              <div className="relative z-10">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest uppercase ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  NTI
                </span>
                <h2 className="font-headline mb-8 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
                  {content.finalCTA.title}
                </h2>
                <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl">
                  {content.finalCTA.description}
                </p>
                <LandingAuthActions
                  className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-auto sm:flex-row"
                  authenticatedClassName="text-primary w-full rounded-xl bg-white px-10 py-5 text-center text-sm font-black tracking-wider uppercase shadow-xl transition-all hover:-translate-y-1 sm:w-auto"
                  unauthenticatedActions={[
                    {
                      className:
                        'text-primary w-full rounded-xl bg-white px-10 py-5 text-center text-sm font-black tracking-wider uppercase shadow-xl transition-all hover:-translate-y-1 sm:w-auto',
                      href: content.finalCTA.primaryCTA.href,
                      label: content.finalCTA.primaryCTA.label,
                    },
                    {
                      className:
                        'bg-tertiary-fixed-dim text-on-tertiary-fixed w-full rounded-xl px-10 py-5 text-center text-sm font-black tracking-wider uppercase shadow-xl transition-all hover:-translate-y-1 sm:w-auto',
                      href: content.finalCTA.secondaryCTA.href,
                      label: content.finalCTA.secondaryCTA.label,
                    },
                  ]}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
