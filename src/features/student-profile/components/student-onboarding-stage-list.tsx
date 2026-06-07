import { t } from '@lingui/core/macro';

import type { OnboardingStageConfig, StudentOnboardingStageId } from '../lib/config';

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
            className={`focus-visible:ring-ring rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isActive
                ? 'border-primary bg-card shadow-sm'
                : 'border-border bg-card/70 hover:bg-card'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-foreground text-base font-semibold">{stage.title}</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  stage.completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}
              >
                {stage.completed ? t`Complete` : t`Pending`}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">{stage.description}</p>
          </button>
        );
      })}
    </div>
  );
}
