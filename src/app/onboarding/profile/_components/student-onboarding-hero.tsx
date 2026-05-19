import { t } from '@lingui/core/macro';

import { PageSectionHeader } from 'components/layout';
import type {
  OnboardingStageConfig,
  StudentOnboardingStageId,
} from 'features/student-profile-flow';

import { StudentOnboardingStageList } from './student-onboarding-stage-list';

type StudentOnboardingHeroProps = {
  stages: OnboardingStageConfig[];
  activeStage: StudentOnboardingStageId;
  onStageChange: (stage: StudentOnboardingStageId) => void;
};

export function StudentOnboardingHero({
  stages,
  activeStage,
  onStageChange,
}: StudentOnboardingHeroProps) {
  return (
    <section className="border-b border-black/8 bg-[#e7e8eb] px-5 py-5 sm:px-8">
      <PageSectionHeader
        eyebrow={t`POST-INVITE ONBOARDING`}
        title={t`Complete your student profile`}
        description={t`You already joined the invited team. Finish the academic and professional sections, then use the final completion action to unlock the main app.`}
        titleClassName="text-3xl"
        descriptionClassName="max-w-3xl text-sm leading-6"
      />

      <StudentOnboardingStageList
        stages={stages}
        activeStage={activeStage}
        onStageChange={onStageChange}
      />
    </section>
  );
}
