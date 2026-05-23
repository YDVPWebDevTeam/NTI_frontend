import { t } from '@lingui/core/macro';

import type { StudentProfileCompletionDto } from 'lib/api';
import type { StudentRegistrationValues } from 'lib/auth/schemas';

export type StudentRegistrationStepId = 'identity' | 'email' | 'academic' | 'skills' | 'review';
export type StudentOnboardingStageId = 'academic' | 'skills';

export const STUDENT_PROFILE_FIELD_GROUPS = {
  identity: ['firstName', 'lastName', 'email', 'password', 'acceptTerms'],
  email: ['verificationCode'],
  academic: [
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
  skills: [
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
  review: [],
} satisfies Record<StudentRegistrationStepId, (keyof StudentRegistrationValues)[]>;

export type RegistrationStepConfig = {
  id: StudentRegistrationStepId;
  label: string;
  stepText: string;
  fields: (keyof StudentRegistrationValues)[];
  description: string;
};

export type OnboardingStageConfig = {
  id: StudentOnboardingStageId;
  title: string;
  description: string;
  completed: boolean;
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
      fields: STUDENT_PROFILE_FIELD_GROUPS.identity,
      description: t`Create your registration profile with core credentials and accept the institutional privacy terms.`,
    },
    {
      id: 'email',
      label: t`Email Confirmation`,
      stepText: t`Step ${EMAIL_STEP_NUMBER}`,
      fields: STUDENT_PROFILE_FIELD_GROUPS.email,
      description: t`Confirm your email address from the message sent to your inbox before full platform access.`,
    },
    {
      id: 'academic',
      label: t`Academic Information`,
      stepText: t`Step ${ACADEMIC_STEP_NUMBER}`,
      fields: STUDENT_PROFILE_FIELD_GROUPS.academic,
      description: t`Tell us about your educational background.`,
    },
    {
      id: 'skills',
      label: t`Professional Skills`,
      stepText: t`Step ${SKILLS_STEP_NUMBER}`,
      fields: STUDENT_PROFILE_FIELD_GROUPS.skills,
      description: t`Highlight your technical and soft skills for potential partners.`,
    },
    {
      id: 'review',
      label: t`Review`,
      stepText: t`Step ${REVIEW_STEP_NUMBER}`,
      fields: STUDENT_PROFILE_FIELD_GROUPS.review,
      description: t`Please review your information before completing the registration.`,
    },
  ];
}

export function getStudentOnboardingStageMeta(stageId: StudentOnboardingStageId) {
  if (stageId === 'academic') {
    return {
      title: t`Academic Information`,
      description: t`Save your academic section first so professional data can be attached to a valid student profile.`,
    };
  }

  return {
    title: t`Professional Skills`,
    description: t`Add your CV, skills, and supporting professional details.`,
  };
}

export function getStudentOnboardingStages(
  completion: StudentProfileCompletionDto,
): OnboardingStageConfig[] {
  return [
    {
      id: 'academic',
      title: t`Academic information`,
      description: t`Education details, academic verification, and declaration.`,
      completed: completion.academicInformationCompleted,
    },
    {
      id: 'skills',
      title: t`Professional skills`,
      description: t`CV, technical skills, roles, links, and projects.`,
      completed: completion.professionalSkillsCompleted,
    },
  ];
}

export function getNextStudentOnboardingStage(
  completion: StudentProfileCompletionDto,
): StudentOnboardingStageId {
  if (!completion.academicInformationCompleted) {
    return 'academic';
  }

  if (!completion.professionalSkillsCompleted) {
    return 'skills';
  }

  return 'skills';
}
