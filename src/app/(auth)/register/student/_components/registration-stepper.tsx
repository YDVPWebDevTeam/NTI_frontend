import {
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  GraduationCap,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';

import { cn } from 'lib/utils';
import type { RegistrationStepConfig } from '../_lib/registration-config';

type RegistrationStepperProps = {
  steps: RegistrationStepConfig[];
  activeStepIndex: number;
  isCompletionStep: boolean;
};

export function RegistrationStepper({
  steps,
  activeStepIndex,
  isCompletionStep,
}: RegistrationStepperProps) {
  const currentIndex = isCompletionStep ? steps.length : activeStepIndex;
  const stepIcons = {
    identity: ShieldCheck,
    email: MailCheck,
    academic: GraduationCap,
    skills: BriefcaseBusiness,
    review: ClipboardCheck,
  } as const;

  return (
    <div className="bg-[#041d67] px-5 py-5 text-white sm:px-8 lg:px-10">
      <div className="scrollbar-hide flex items-center justify-between gap-2 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 lg:gap-4 [&::-webkit-scrollbar]:hidden">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = !isCompletionStep && index === currentIndex;
          const StepIcon = stepIcons[step.id];
          const stepStateClass = isCompleted
            ? 'border-blue-400 bg-blue-500 text-white'
            : 'border-white/25 bg-white/10 text-white/60';

          const activeStepStateClass = 'border-white bg-white text-[#041d67]';

          return (
            <div key={step.id} className="flex min-w-[max-content] items-center gap-3">
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
                  {step.stepText}
                </p>
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-white' : 'text-white/60',
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
