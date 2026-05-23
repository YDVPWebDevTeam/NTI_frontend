import type { ReactNode } from 'react';
import type { StudentRegistrationStepId } from 'features/student-profile';

import { AcademicStep, SkillsStep } from 'features/student-profile';
import { EmailStep } from './email-step';
import { IdentityStep } from './identity-step';
import { ReviewStep } from './review-step';

type RegistrationStepContentProps = {
  stepId: StudentRegistrationStepId;
  isResending: boolean;
  onResend: (email: string) => Promise<boolean>;
};

export function RegistrationStepContent({
  stepId,
  isResending,
  onResend,
}: RegistrationStepContentProps) {
  const stepContentById: Record<StudentRegistrationStepId, ReactNode> = {
    identity: <IdentityStep />,
    email: <EmailStep isResending={isResending} onResend={onResend} />,
    academic: <AcademicStep />,
    skills: <SkillsStep />,
    review: <ReviewStep />,
  };

  return stepContentById[stepId] ?? null;
}
