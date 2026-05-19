import { t } from '@lingui/core/macro';

import { Button, Card, CardContent } from 'components/shadcn';
import type { StudentProfileCompletionDto } from 'lib/api/student-profile/types';
import type { StudentOnboardingStageId } from 'features/student-profile-flow';

type StudentOnboardingActionsProps = {
  activeStage: StudentOnboardingStageId;
  completion: StudentProfileCompletionDto;
  isBusy: boolean;
  isCompletingProfile: boolean;
  onStageChange: (stage: StudentOnboardingStageId) => void;
  onSaveAcademic: () => void;
  onSaveSkills: () => void;
  onCompleteProfile: () => void;
};

const SAVE_ACTION_LABELS = {
  academic: t`Save academic information`,
  skills: t`Save professional skills`,
} as const;

export function StudentOnboardingActions({
  activeStage,
  completion,
  isBusy,
  isCompletingProfile,
  onStageChange,
  onSaveAcademic,
  onSaveSkills,
  onCompleteProfile,
}: StudentOnboardingActionsProps) {
  if (activeStage === 'complete') {
    return (
      <Card className="border-black/10 bg-white shadow-sm">
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-black/10 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-900">{t`Academic section`}</p>
              <p className="mt-2 text-sm text-neutral-600">
                {completion.academicInformationCompleted
                  ? t`Ready for final completion.`
                  : t`Still incomplete. Return to the academic stage to finish it.`}
              </p>
            </div>
            <div className="rounded-lg border border-black/10 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-900">{t`Professional section`}</p>
              <p className="mt-2 text-sm text-neutral-600">
                {completion.professionalSkillsCompleted
                  ? t`Ready for final completion.`
                  : t`Still incomplete. Return to the professional stage to finish it.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => onStageChange('academic')}>
              {t`Edit academic information`}
            </Button>
            <Button type="button" variant="outline" onClick={() => onStageChange('skills')}>
              {t`Edit professional skills`}
            </Button>
            <Button
              type="button"
              disabled={
                isBusy ||
                !completion.academicInformationCompleted ||
                !completion.professionalSkillsCompleted
              }
              onClick={onCompleteProfile}
              className="bg-[#1e58d5] hover:bg-[#245fdc]"
            >
              {isCompletingProfile ? t`Completing…` : t`Complete profile`}
            </Button>
          </div>
        </CardContent>
      </Card>
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
