import type { ReactNode } from 'react';

import { AcademicStep } from './academic-step';
import { EmailStep } from './email-step';
import { IdentityStep } from './identity-step';
import { ReviewStep } from './review-step';
import { SkillsStep } from './skills-step';
import type { StudentRegistrationStepId } from '../_lib/registration-config';

type RegistrationStepContentProps = {
  stepId: StudentRegistrationStepId;
  isResending: boolean;
  onResend: (email: string) => Promise<void>;
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
