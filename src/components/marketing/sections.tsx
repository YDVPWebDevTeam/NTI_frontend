import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { Reveal } from 'components/landing';
import { cn } from 'lib/utils';

import { getMarketingIcon } from './icons';

/** Per-item delay (ms) for staggered scroll-reveal animations. */
const STAGGER_MS = 90;

export type MarketingAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

export type MarketingFeature = {
  icon: string;
  title: string;
  description: string;
  bullets?: string[];
};

export type MarketingStep = {
  title: string;
  description: string;
};

function actionClass(variant: MarketingAction['variant']) {
  if (variant === 'secondary') {
    return 'bg-surface-container-highest text-primary hover:bg-surface-container-high ring-1 ring-primary/10';
  }

  return 'primary-gradient text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30';
}

export function ActionButtons({
  actions,
  className,
}: {
  actions: MarketingAction[];
  className?: string;
}) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row', className)}>
      {actions.map((action) => (
        <Link
          key={`${action.href}:${action.label}`}
          href={action.href}
          className={cn(
            'group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-center font-bold transition-all hover:-translate-y-0.5',
            actionClass(action.variant),
          )}
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}

export function MarketingHero({
  eyebrow,
  title,
  description,
  actions = [],
  image,
  compactTop = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: MarketingAction[];
  image?: { url: string; alt: string };
  /** When the hero sits below other content (e.g. a tab switcher), drop the
   * large top padding that normally clears the fixed header. */
  compactTop?: boolean;
}) {
  return (
    <section
      className={cn(
        'bg-surface relative overflow-hidden pb-16 md:pb-24',
        compactTop ? 'pt-10 md:pt-14' : 'pt-32 md:pt-44',
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-primary-fixed-dim/25 animate-blob absolute -top-24 -right-16 h-[26rem] w-[26rem] rounded-full blur-3xl" />
        <div className="bg-tertiary-fixed-dim/15 animate-blob absolute top-40 -left-24 h-80 w-80 rounded-full blur-3xl [animation-delay:-6s]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div
          className={cn(
            'grid items-center gap-12',
            image ? 'lg:grid-cols-12' : 'mx-auto max-w-3xl text-center',
          )}
        >
          <Reveal className={image ? 'lg:col-span-7' : 'flex flex-col items-center'}>
            <span className="border-tertiary/30 bg-tertiary-fixed/60 text-on-tertiary-fixed mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
              {eyebrow}
            </span>
            <h1 className="font-headline text-on-surface text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p
              className={cn(
                'text-on-surface-variant mt-6 max-w-2xl text-lg leading-relaxed md:text-xl',
                image ? '' : 'mx-auto',
              )}
            >
              {description}
            </p>
            <ActionButtons
              actions={actions}
              className={cn('mt-8', image ? '' : 'justify-center')}
            />
          </Reveal>
          {image ? (
            <Reveal className="lg:col-span-5" delay={150}>
              <div className="animate-float-slow shadow-primary/15 relative aspect-square w-full overflow-hidden rounded-3xl border-4 border-white/60 shadow-2xl">
                <Image fill alt={image.alt} className="object-cover" src={image.url} unoptimized />
                <div className="from-primary/30 absolute inset-0 bg-gradient-to-t to-transparent" />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <Reveal className={cn('mb-12', align === 'center' && 'text-center')}>
      {eyebrow ? (
        <p className="text-tertiary mb-2 text-xs font-bold tracking-widest uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="font-headline text-on-surface text-3xl font-bold sm:text-4xl">{title}</h2>
      {description ? (
        <p
          className={cn(
            'text-on-surface-variant mt-4 text-lg leading-relaxed',
            align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl',
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

export function FeatureGrid({
  features,
  columns = 3,
}: {
  features: MarketingFeature[];
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {features.map((feature, index) => (
        <Reveal key={feature.title} delay={index * STAGGER_MS}>
          <div className="group bg-surface-container-lowest hover:shadow-primary/10 h-full rounded-2xl p-8 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <span className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
              {getMarketingIcon(feature.icon, 'h-7 w-7')}
            </span>
            <h3 className="font-headline text-on-surface mb-3 text-xl font-bold">
              {feature.title}
            </h3>
            <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>
            {feature.bullets && feature.bullets.length > 0 ? (
              <ul className="mt-5 space-y-2.5">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium">
                    <CheckCircle2 className="text-tertiary mt-0.5 h-5 w-5 shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function StepList({ steps }: { steps: MarketingStep[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <Reveal key={step.title} delay={index * STAGGER_MS}>
          <div className="relative h-full">
            <span className="font-headline text-surface-container-high text-6xl font-black select-none">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-headline text-on-surface mt-2 text-lg font-bold">{step.title}</h3>
            <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function CTASection({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: MarketingAction[];
}) {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="primary-gradient shadow-primary/20 relative overflow-hidden rounded-3xl p-12 text-center text-white shadow-2xl md:p-16">
            <div className="animate-blob absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="animate-blob bg-tertiary-fixed-dim/20 absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full blur-3xl [animation-delay:-8s]" />
            <div className="relative z-10">
              <h2 className="font-headline mb-6 text-3xl leading-tight font-extrabold tracking-tight md:text-4xl">
                {title}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-100">
                {description}
              </p>
              <ActionButtons actions={actions} className="justify-center" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
