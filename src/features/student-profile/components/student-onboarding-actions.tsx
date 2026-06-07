import { t } from '@lingui/core/macro';

import { Button } from 'components/shadcn';
import type { StudentOnboardingStageId } from '../lib/config';

type StudentOnboardingActionsProps = {
  activeStage: StudentOnboardingStageId;
  isBusy: boolean;
  isComplete?: boolean;
  onContinue?: () => void;
  onStageChange: (stage: StudentOnboardingStageId) => void;
  onSaveAcademic: () => void;
  onSaveSkills: () => void;
};

export function StudentOnboardingActions({
  activeStage,
  isBusy,
  isComplete = false,
  onContinue,
  onStageChange,
  onSaveAcademic,
  onSaveSkills,
}: StudentOnboardingActionsProps) {
  const saveActionLabel =
    activeStage === 'academic' ? t`Save academic information` : t`Save professional skills`;

  if (isComplete) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={onContinue}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
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
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isBusy ? t`Saving…` : saveActionLabel}
      </Button>
    </div>
  );
}
