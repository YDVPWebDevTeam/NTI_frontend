import type { StudentProfileUserDto } from 'lib/api';

import type { StudentOnboardingStageId } from '../lib/config';

import { AcademicStep } from './academic-step';
import { SkillsStep } from './skills-step';
import { StudentEmailStage } from './student-email-stage';

type StudentOnboardingBodyProps = {
  activeStage: StudentOnboardingStageId;
  user: StudentProfileUserDto;
  onRefresh: () => void;
};

export function StudentOnboardingBody({
  activeStage,
  user,
  onRefresh,
}: StudentOnboardingBodyProps) {
  if (activeStage === 'academic') {
    return <AcademicStep />;
  }

  if (activeStage === 'student-email') {
    return <StudentEmailStage user={user} onRefresh={onRefresh} />;
  }

  return <SkillsStep />;
}
