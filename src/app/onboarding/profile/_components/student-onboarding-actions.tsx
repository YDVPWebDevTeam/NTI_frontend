import { t } from '@lingui/core/macro';

import { Button } from 'components/shadcn';
import type { StudentOnboardingStageId } from 'features/student-profile-flow';

type StudentOnboardingActionsProps = {
  activeStage: StudentOnboardingStageId;
  isBusy: boolean;
  isComplete?: boolean;
  onContinue?: () => void;
  onStageChange: (stage: StudentOnboardingStageId) => void;
  onSaveAcademic: () => void;
  onSaveSkills: () => void;
};

const SAVE_ACTION_LABELS = {
  academic: t`Save academic information`,
  skills: t`Save professional skills`,
} as const;

export function StudentOnboardingActions({
  activeStage,
  isBusy,
  isComplete = false,
  onContinue,
  onStageChange,
  onSaveAcademic,
  onSaveSkills,
}: StudentOnboardingActionsProps) {
  if (isComplete) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onContinue} className="bg-[#1e58d5] hover:bg-[#245fdc]">
          {t`Go to dashboard`}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {activeStage === 'skills' ? (
        <Button type="button" variant="outline" onClick={() => onStageChange('academic')}>
          {t`Back to academic`}
        </Button>
      ) : null}

      <Button
        type="button"
        disabled={isBusy}
        onClick={activeStage === 'academic' ? onSaveAcademic : onSaveSkills}
        className="bg-[#1e58d5] hover:bg-[#245fdc]"
      >
        {isBusy ? t`Saving…` : SAVE_ACTION_LABELS[activeStage]}
      </Button>
    </div>
  );
}
