import { t } from '@lingui/core/macro';

import { Button } from 'components/shadcn';
import type { StudentOnboardingStageId } from '../lib/config';

type StudentOnboardingActionsProps = {
  activeStage: StudentOnboardingStageId;
  isBusy: boolean;
  onStageChange: (stage: StudentOnboardingStageId) => void;
  onSaveAcademic: () => void;
  onSaveSkills: () => void;
};

export function StudentOnboardingActions({
  activeStage,
  isBusy,
  onStageChange,
  onSaveAcademic,
  onSaveSkills,
}: StudentOnboardingActionsProps) {
  // The student-email stage manages its own actions inside StudentEmailStage;
  // here we only surface navigation back to the professional skills stage.
  if (activeStage === 'student-email') {
    return (
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={() => onStageChange('skills')}>
          {t`Back to professional skills`}
        </Button>
      </div>
    );
  }

  const saveActionLabel =
    activeStage === 'academic' ? t`Save academic information` : t`Save professional skills`;

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
