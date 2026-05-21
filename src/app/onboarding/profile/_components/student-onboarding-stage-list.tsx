import { t } from '@lingui/core/macro';

import type {
  OnboardingStageConfig,
  StudentOnboardingStageId,
} from 'features/student-profile-flow';

type StudentOnboardingStageListProps = {
  stages: OnboardingStageConfig[];
  activeStage: StudentOnboardingStageId;
  onStageChange: (stage: StudentOnboardingStageId) => void;
};

export function StudentOnboardingStageList({
  stages,
  activeStage,
  onStageChange,
}: StudentOnboardingStageListProps) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {stages.map((stage) => {
        const isActive = activeStage === stage.id;

        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onStageChange(stage.id)}
            aria-pressed={isActive}
            className={`rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#1e58d5] focus-visible:ring-offset-2 ${
              isActive
                ? 'border-[#1e58d5] bg-white shadow-sm'
                : 'border-black/10 bg-white/70 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-[#0c1a4f]">{stage.title}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  stage.completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {stage.completed ? t`Complete` : t`Pending`}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{stage.description}</p>
          </button>
        );
      })}
    </div>
  );
}
