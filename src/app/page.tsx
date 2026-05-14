import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FlaskConical,
  Rocket,
  UserRoundCog,
  Users,
} from 'lucide-react';

import { LandingFooter, LandingHeader } from 'components/layout';
import { fetchLandingPageContent, type LandingPageContent } from 'lib/cms/landing-page';
import { getRequestLocale } from 'lib/i18n/server-locale';

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
      button: 'border-tertiary text-tertiary hover:bg-tertiary hover:text-white',
      card: 'border-tertiary',
      icon: 'text-tertiary bg-tertiary/10',
    };
  }

  return {
    button: 'border-primary text-primary hover:bg-primary hover:text-white',
    card: 'border-primary',
    icon: 'text-primary bg-primary/10',
  };
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const content = await fetchLandingPageContent(locale);

  return (
    <div className="bg-surface font-body text-on-surface overflow-x-hidden antialiased">
      <LandingHeader />

      <section
        className="bg-surface relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32"
        id="about"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              <span className="bg-tertiary-fixed text-on-tertiary-fixed inline-block rounded px-3 py-1 text-xs font-bold tracking-widest uppercase">
                {content.hero.eyebrow}
              </span>
              <h1 className="font-headline text-on-surface text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
                {content.hero.titlePrefix}{' '}
                <span className="text-primary">{content.hero.titleHighlight}</span>{' '}
                {content.hero.titleSuffix}
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed md:text-xl">
                {content.hero.description}
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Link
                  href={content.hero.primaryCTA.href}
                  className="primary-gradient w-full rounded-lg px-8 py-4 text-center font-bold text-white shadow-xl transition-all hover:shadow-2xl sm:w-auto"
                >
                  {content.hero.primaryCTA.label}
                </Link>
                <Link
                  href={content.hero.secondaryCTA.href}
                  className="bg-surface-container-highest text-primary hover:bg-surface-container-high w-full rounded-lg px-8 py-4 text-center font-bold transition-all sm:w-auto"
                >
                  {content.hero.secondaryCTA.label}
                </Link>
              </div>
              <Link
                className="text-primary inline-flex items-center gap-2 font-bold hover:underline"
                href={content.hero.learnMoreCTA.href}
              >
                {content.hero.learnMoreCTA.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative mt-10 lg:col-span-5 lg:mt-0">
              <div className="bg-primary-container/10 absolute -top-12 -right-12 aspect-square h-64 w-64 rounded-full blur-3xl md:h-96 md:w-96"></div>
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border-4 border-white/50 shadow-2xl sm:w-4/5 lg:w-full">
                <Image
                  fill
                  alt={content.hero.heroImage.alt}
                  className="object-cover"
                  src={content.hero.heroImage.url}
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-24" id="programs">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="font-headline mb-4 text-4xl font-bold">{content.programs.heading}</h2>
            <div className="bg-tertiary-fixed-dim h-1.5 w-20 rounded-full"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {content.programs.items.map((program) => {
              const accent = accentClasses(program.accent);

              return (
                <div
                  key={program.title}
                  className={`bg-surface-container-lowest rounded-xl border-b-4 p-10 shadow-sm transition-shadow hover:shadow-xl ${accent.card}`}
                >
                  <div className="mb-8">
                    {getIcon(program.icon, `${accent.icon} h-16 w-16 rounded-lg p-3`)}
                  </div>
                  <h3 className="font-headline mb-4 text-2xl font-extrabold">{program.title}</h3>
                  <p className="text-on-surface-variant mb-8 leading-relaxed">
                    {program.description}
                  </p>
                  <ul className="mb-10 space-y-4">
                    {program.bulletItems.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3 text-sm font-medium">
                        <CheckCircle2 className="text-tertiary h-5 w-5" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={program.cta.href}
                    className={`block w-full rounded border-2 py-4 text-center font-bold transition-all ${accent.button}`}
                  >
                    {program.cta.label}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface py-24" id="infrastructure">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="text-tertiary mb-2 text-xs font-bold tracking-widest uppercase">
              {content.infrastructure.eyebrow}
            </p>
            <h2 className="font-headline text-4xl font-bold">{content.infrastructure.heading}</h2>
          </div>
          <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
            <div className="bg-surface-container group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-2xl p-8 md:col-span-2 md:row-span-2">
              <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20">
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

            {content.infrastructure.cards.map((card, index) => {
              const tone = toneClasses(card.tone);
              const wide = index === 0;

              return (
                <div
                  key={card.title}
                  className={`${tone.body} ${wide ? 'rounded-2xl p-8 md:col-span-2' : 'rounded-2xl p-8'} flex ${wide ? 'items-center gap-6' : 'flex-col justify-between'}`}
                >
                  {getIcon(
                    card.icon,
                    `${wide ? 'h-10 w-10' : 'h-8 w-8'} ${card.tone === 'surface' ? 'text-tertiary' : ''}`,
                  )}
                  <div>
                    <h4 className="mb-1 text-xl font-bold">{card.title}</h4>
                    <p className={`${tone.copy} text-sm`}>{card.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low overflow-hidden py-24" id="mentors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-3">
            <div>
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
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:col-span-2">
              {content.ecosystem.mentors.map((mentor) => (
                <div
                  key={mentor.name}
                  className="bg-surface-container-lowest border-outline-variant/20 flex gap-4 rounded-lg border-b-2 p-6"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
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
              ))}
              <div className="bg-primary-container flex items-center justify-between rounded-lg p-6 text-white md:col-span-2">
                <div className="flex items-center gap-4">
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
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{content.ecosystem.successHighlight.metric}</p>
                  <p className="text-xs opacity-70">{content.ecosystem.successHighlight.subtext}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="primary-gradient relative overflow-hidden rounded-3xl p-12 text-center text-white md:p-20">
            <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="font-headline mb-8 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
                {content.finalCTA.title}
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl">
                {content.finalCTA.description}
              </p>
              <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-auto sm:flex-row">
                <Link
                  href={content.finalCTA.primaryCTA.href}
                  className="text-primary w-full rounded-lg bg-white px-10 py-5 text-sm font-black tracking-wider uppercase shadow-xl transition-all hover:-translate-y-1 sm:w-auto"
                >
                  {content.finalCTA.primaryCTA.label}
                </Link>
                <Link
                  href={content.finalCTA.secondaryCTA.href}
                  className="bg-tertiary-fixed-dim text-on-tertiary-fixed w-full rounded-lg px-10 py-5 text-sm font-black tracking-wider uppercase shadow-xl transition-all hover:-translate-y-1 sm:w-auto"
                >
                  {content.finalCTA.secondaryCTA.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
