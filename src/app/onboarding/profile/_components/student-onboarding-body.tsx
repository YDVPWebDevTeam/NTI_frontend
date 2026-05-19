import type { StudentOnboardingStageId } from 'features/student-profile-flow';

import { AcademicStep } from 'app/(auth)/register/student/_components/academic-step';
import { ReviewStep } from 'app/(auth)/register/student/_components/review-step';
import { SkillsStep } from 'app/(auth)/register/student/_components/skills-step';

type StudentOnboardingBodyProps = {
  activeStage: StudentOnboardingStageId;
};

export function StudentOnboardingBody({ activeStage }: StudentOnboardingBodyProps) {
  if (activeStage === 'academic') {
    return <AcademicStep />;
  }

  if (activeStage === 'skills') {
    return <SkillsStep />;
  }

  return <ReviewStep />;
}
