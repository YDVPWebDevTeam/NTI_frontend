import { t } from '@lingui/core/macro';

import { PageSectionHeader } from 'components/layout';
import type { OnboardingStageConfig, StudentOnboardingStageId } from '../lib/config';

import { StudentOnboardingStageList } from './student-onboarding-stage-list';

type StudentOnboardingHeroProps = {
  stages: OnboardingStageConfig[];
  activeStage: StudentOnboardingStageId;
  onStageChange: (stage: StudentOnboardingStageId) => void;
  variant?: 'invite-onboarding' | 'profile-update';
};

export function StudentOnboardingHero({
  stages,
  activeStage,
  onStageChange,
  variant = 'invite-onboarding',
}: StudentOnboardingHeroProps) {
  const isProfileUpdate = variant === 'profile-update';

  return (
    <section
      className={`border-b border-black/8 px-5 py-5 sm:px-8 ${
        isProfileUpdate ? 'bg-white' : 'bg-[#e7e8eb]'
      }`}
    >
      <PageSectionHeader
        eyebrow={isProfileUpdate ? t`PROFILE SETTINGS` : t`POST-INVITE ONBOARDING`}
        title={isProfileUpdate ? t`Update your student profile` : t`Complete your student profile`}
        description={
          isProfileUpdate
            ? t`Keep your academic and professional information up to date.`
            : t`You already joined the invited team. Finish the academic and professional sections to unlock the main app.`
        }
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
