'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useId, useRef } from 'react';

import { Reveal } from 'components/landing';
import { cn } from 'lib/utils';

import {
  CTASection,
  FeatureGrid,
  MarketingHero,
  SectionHeading,
  StepList,
  type MarketingAction,
  type MarketingFeature,
  type MarketingStep,
} from './sections';

type ProgramSection = {
  eyebrow: string;
  title: string;
  description?: string;
  features: MarketingFeature[];
};

export type ProgramView = {
  /** Stable key used by the toggle + URL (`a` | `b`). */
  key: 'a' | 'b';
  /** Short label shown inside the segmented toggle. */
  tabLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    actions: MarketingAction[];
    image: { url: string; alt: string };
  };
  /** One or more feature sections (Program A has 1, Program B has 2). */
  sections: ProgramSection[];
  steps: { eyebrow: string; title: string; items: MarketingStep[] };
  cta: { title: string; description: string; actions: MarketingAction[] };
};

/**
 * Split a tab label like `"Program A · Rozbeh startupu"` into a bold lead
 * (`"Program A"`) and a lighter subtitle (`"Rozbeh startupu"`) so the toggle
 * reads as two tidy tiers instead of one long, awkwardly-wrapping line.
 */
function splitTabLabel(label: string): [string, string] {
  const [lead, ...rest] = label.split('·');

  return [lead.trim(), rest.join('·').trim()];
}

function ProgramBody({ program }: { program: ProgramView }) {
  return (
    <>
      <MarketingHero
        compactTop
        eyebrow={program.hero.eyebrow}
        title={program.hero.title}
        description={program.hero.description}
        actions={program.hero.actions}
        image={program.hero.image}
      />

      {program.sections.map((section, index) => (
        <section
          key={section.title}
          className={cn(
            'py-20 md:py-24',
            index % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface',
          )}
        >
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow={section.eyebrow}
              title={section.title}
              description={section.description}
            />
            <FeatureGrid features={section.features} />
          </div>
        </section>
      ))}

      <section
        className={cn(
          'py-20 md:py-24',
          program.sections.length % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface',
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow={program.steps.eyebrow} title={program.steps.title} />
          <StepList steps={program.steps.items} />
        </div>
      </section>

      <CTASection
        title={program.cta.title}
        description={program.cta.description}
        actions={program.cta.actions}
      />
    </>
  );
}

export function ProgramsExplorer({
  heading,
  programs,
}: {
  heading: { eyebrow: string; title: string; description: string };
  programs: [ProgramView, ProgramView];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tablistId = useId();

  // Derive active tab from URL — no separate state needed.
  const active: 'a' | 'b' = searchParams.get('program') === 'b' ? 'b' : 'a';
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectProgram = useCallback(
    (key: 'a' | 'b') => {
      const params = new URLSearchParams(searchParams.toString());

      params.set('program', key);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? (index + 1) % 2 : (index + 1) % 2;
    const nextKey = programs[next].key;

    selectProgram(nextKey);
    tabRefs.current[next]?.focus();
  };

  const activeProgram = active === programs[0].key ? programs[0] : programs[1];

  return (
    <>
      {/* ─── Switcher ─────────────────────────────────────────── */}
      <section className="bg-surface relative overflow-hidden pt-32 pb-2 md:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid absolute inset-0 opacity-60" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <Reveal>
            <p className="text-tertiary mb-2 text-xs font-bold tracking-widest uppercase">
              {heading.eyebrow}
            </p>
            <h1 className="font-headline text-on-surface text-4xl font-extrabold tracking-tight sm:text-5xl">
              {heading.title}
            </h1>
            <p className="text-on-surface-variant mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
              {heading.description}
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div
              role="tablist"
              aria-label={heading.title}
              className="bg-surface-container-high ring-outline-variant/40 relative mx-auto mt-10 grid w-full max-w-xl grid-cols-2 gap-1.5 rounded-[1.25rem] p-1.5 shadow-sm ring-1"
            >
              {/* sliding highlight */}
              <span
                aria-hidden
                className="primary-gradient shadow-primary/30 absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-2xl shadow-lg transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{
                  transform: active === programs[1].key ? 'translateX(100%)' : 'translateX(0)',
                }}
              />
              {programs.map((program, index) => {
                const selected = program.key === active;
                const [primaryLabel, secondaryLabel] = splitTabLabel(program.tabLabel);

                return (
                  <button
                    key={program.key}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`${tablistId}-tab-${program.key}`}
                    aria-selected={selected}
                    aria-controls={`${tablistId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectProgram(program.key)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                    className={cn(
                      'focus-visible:ring-primary relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-2xl px-4 py-3 leading-tight tracking-tight transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                      selected ? 'text-white' : 'text-on-surface-variant hover:text-on-surface',
                    )}
                  >
                    <span className="text-sm font-bold">{primaryLabel}</span>
                    {secondaryLabel ? (
                      <span
                        className={cn(
                          'text-xs font-medium transition-colors duration-200',
                          selected ? 'text-white/80' : 'text-on-surface-variant/65',
                        )}
                      >
                        {secondaryLabel}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Active program body (cross-fades on switch) ──────── */}
      <div
        key={activeProgram.key}
        id={`${tablistId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tablistId}-tab-${activeProgram.key}`}
        className="animate-program-fade"
      >
        <ProgramBody program={activeProgram} />
      </div>
    </>
  );
}
