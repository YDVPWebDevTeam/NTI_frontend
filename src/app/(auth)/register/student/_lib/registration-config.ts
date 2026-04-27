import { t } from '@lingui/core/macro';

import type { StudentRegistrationValues } from '../schema';

export type StudentRegistrationStepId = 'identity' | 'email' | 'academic' | 'skills' | 'review';

export type RegistrationStepConfig = {
  id: StudentRegistrationStepId;
  label: string;
  stepText: string;
  fields: (keyof StudentRegistrationValues)[];
  description: string;
};

const IDENTITY_STEP_NUMBER = 1;
const EMAIL_STEP_NUMBER = 2;
const ACADEMIC_STEP_NUMBER = 3;
const SKILLS_STEP_NUMBER = 4;
const REVIEW_STEP_NUMBER = 5;

export function getStudentRegistrationSteps(): RegistrationStepConfig[] {
  return [
    {
      id: 'identity',
      label: t`Identity Verification`,
      stepText: t`Step ${IDENTITY_STEP_NUMBER}`,
      fields: ['firstName', 'lastName', 'email', 'password', 'acceptTerms'],
      description: t`Create your registration profile with core credentials and accept the institutional privacy terms.`,
    },
    {
      id: 'email',
      label: t`Email Confirmation`,
      stepText: t`Step ${EMAIL_STEP_NUMBER}`,
      fields: ['verificationCode'],
      description: t`Confirm your email address from the message sent to your inbox before full platform access.`,
    },
    {
      id: 'academic',
      label: t`Academic Information`,
      stepText: t`Step ${ACADEMIC_STEP_NUMBER}`,
      fields: [
        'universityId',
        'facultyId',
        'specializationId',
        'degreeLevel',
        'studyMode',
        'studyYear',
        'expectedGraduationYear',
        'hasTransferredSubjects',
        'transferredSubjectsCount',
        'profileSubjectsAverage',
        'relevantCourses',
        'academicAchievements',
        'academicEvidenceFileId',
        'academicDeclarationAccepted',
      ],
      description: t`Tell us about your educational background.`,
    },
    {
      id: 'skills',
      label: t`Professional Skills`,
      stepText: t`Step ${SKILLS_STEP_NUMBER}`,
      fields: [
        'focusAreas',
        'preferredRoles',
        'softSkills',
        'githubUrl',
        'linkedinUrl',
        'portfolioUrl',
        'cvFileId',
        'cvFile',
        'skills',
        'projects',
        'bio',
      ],
      description: t`Highlight your technical and soft skills for potential partners.`,
    },
    {
      id: 'review',
      label: t`Review`,
      stepText: t`Step ${REVIEW_STEP_NUMBER}`,
      fields: [],
      description: t`Please review your information before completing the registration.`,
    },
  ];
}
