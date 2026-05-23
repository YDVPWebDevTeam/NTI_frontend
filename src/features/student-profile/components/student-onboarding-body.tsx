import type { StudentOnboardingStageId } from '../lib/config';

import { AcademicStep } from './academic-step';
import { SkillsStep } from './skills-step';

type StudentOnboardingBodyProps = {
  activeStage: StudentOnboardingStageId;
};

export function StudentOnboardingBody({ activeStage }: StudentOnboardingBodyProps) {
  if (activeStage === 'academic') {
    return <AcademicStep />;
  }

  return <SkillsStep />;
}
