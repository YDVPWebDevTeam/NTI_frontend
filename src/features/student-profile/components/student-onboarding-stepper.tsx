import { t } from '@lingui/core/macro';
import { BriefcaseBusiness, Check, GraduationCap, Users } from 'lucide-react';

import { cn } from 'lib/utils';

import type { JourneyStepConfig, StudentJourneyStepId } from '../lib/config';

const STEP_ICONS = {
  academic: GraduationCap,
  skills: BriefcaseBusiness,
  team: Users,
} as const;

type StudentOnboardingStepperProps = {
  stages: JourneyStepConfig[];
  activeStage: StudentJourneyStepId;
};

export function StudentOnboardingStepper({ stages, activeStage }: StudentOnboardingStepperProps) {
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === activeStage),
  );
  const totalSteps = stages.length;

  return (
    <div className="bg-[#041d67] px-5 py-6 text-white sm:px-8 lg:px-10">
      <p className="text-[10px] font-medium tracking-[0.18em] text-white/50 uppercase">
        {t`Step ${activeIndex + 1} of ${totalSteps}`}
      </p>

      <ol className="scrollbar-hide mt-4 flex items-center gap-2 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-0 [&::-webkit-scrollbar]:hidden">
        {stages.map((stage, index) => {
          const isActive = index === activeIndex;
          const isCompleted = stage.completed && !isActive;
          const isLast = index === stages.length - 1;
          const StepIcon = STEP_ICONS[stage.id];
          const stepStateClass = isCompleted
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-white/25 bg-white/10 text-white/60';
          const activeStepStateClass = 'border-white bg-white text-[#041d67]';
          let labelClass = 'text-white/60';

          if (isActive) {
            labelClass = 'text-white';
          } else if (isCompleted) {
            labelClass = 'text-white/80';
          }

          return (
            <li
              key={stage.id}
              aria-current={isActive ? 'step' : undefined}
              className="flex min-w-[max-content] flex-1 items-center gap-3 sm:min-w-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors',
                    stepStateClass,
                    isActive && activeStepStateClass,
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </div>

                <div className={cn('lg:block', isActive ? 'block' : 'hidden')}>
                  <p className="text-[10px] font-medium tracking-[0.12em] text-white/50 uppercase">
                    {t`Step ${index + 1}`}
                  </p>
                  <p className={cn('text-sm font-medium transition-colors', labelClass)}>
                    {stage.title}
                  </p>
                </div>
              </div>

              {isLast ? null : (
                <div
                  aria-hidden
                  className={cn(
                    'mx-2 hidden h-px flex-1 rounded-full transition-colors sm:block',
                    isCompleted ? 'bg-primary' : 'bg-white/20',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
