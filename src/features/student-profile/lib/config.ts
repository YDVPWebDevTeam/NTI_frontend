import { t } from '@lingui/core/macro';

import type { StudentProfileCompletionDto } from 'lib/api';
import type { StudentRegistrationValues } from 'lib/auth/schemas';

export type StudentRegistrationStepId = 'identity' | 'email' | 'academic' | 'skills' | 'review';
export type StudentOnboardingStageId = 'academic' | 'skills';

// The full post-confirmation journey shown in the progress stepper. Identity and
// email happen during registration (gated by email confirmation), so they stay
// outside this stepper. The `team` step lives on a separate page (/student/team)
// but is surfaced here so the journey reads as one continuous, step-by-step flow.
export type StudentJourneyStepId = 'academic' | 'skills' | 'team';

export const STUDENT_PROFILE_FIELD_GROUPS = {
  identity: ['firstName', 'lastName', 'email', 'password', 'acceptTerms'],
  email: [],
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

export type JourneyStepConfig = {
  id: StudentJourneyStepId;
  title: string;
  description: string;
  completed: boolean;
};

const IDENTITY_STEP_NUMBER = 1;
const EMAIL_STEP_NUMBER = 2;

// Registration only collects identity + email. Academic and professional
// details are gathered later in the onboarding flow (/onboarding/profile),
// which a student reaches right after confirming their email.
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
      description: t`Confirm your email address from the message sent to your inbox to continue with onboarding.`,
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

export function getStudentJourneyStepMeta(stepId: StudentJourneyStepId) {
  if (stepId === 'team') {
    return {
      title: t`Build your team`,
      description: t`Name your team and invite your teammates to get started together.`,
    };
  }

  return getStudentOnboardingStageMeta(stepId);
}

// The full onboarding journey rendered in the progress stepper across both the
// profile page and the team page: academic → skills → team.
export function getStudentJourneySteps(
  completion: StudentProfileCompletionDto,
  hasTeam: boolean,
): JourneyStepConfig[] {
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
    {
      id: 'team',
      title: t`Build your team`,
      description: t`Create your team and invite your teammates.`,
      completed: hasTeam,
    },
  ];
}

export function isOnboardingJourneyComplete(
  completion: StudentProfileCompletionDto,
  hasTeam: boolean,
): boolean {
  return (
    completion.academicInformationCompleted && completion.professionalSkillsCompleted && hasTeam
  );
}
