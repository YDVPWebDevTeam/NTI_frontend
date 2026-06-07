import type { ReactNode } from 'react';
import type { StudentRegistrationStepId } from 'features/student-profile';

import { AcademicStep, SkillsStep } from 'features/student-profile';
import { EmailStep } from './email-step';
import { IdentityStep } from './identity-step';
import { ReviewStep } from './review-step';

type RegistrationStepContentProps = {
  stepId: StudentRegistrationStepId;
};

export function RegistrationStepContent({ stepId }: RegistrationStepContentProps) {
  const stepContentById: Record<StudentRegistrationStepId, ReactNode> = {
    identity: <IdentityStep />,
    email: <EmailStep />,
    academic: <AcademicStep />,
    skills: <SkillsStep />,
    review: <ReviewStep />,
  };

  return stepContentById[stepId] ?? null;
}
