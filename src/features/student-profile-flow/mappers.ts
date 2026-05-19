import type {
  CompleteStudentProfileRequest,
  GetMyStudentProfileResponse,
  UpdateAcademicInformationRequest,
  UpdateProfessionalSkillsRequest,
} from 'lib/api/student-profile/types';
import { getCurrentYear } from 'lib/date';

import { getStudentProfileDefaultValues } from './default-values';
import type { StudentRegistrationValues } from './types';

function toOptionalString(value?: string | null) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function filterNonEmptyStrings(values: string[]) {
  return values.filter(Boolean);
}

export function mapStudentProfileToFormValues(
  profileData: GetMyStudentProfileResponse,
): StudentRegistrationValues {
  const defaults = getStudentProfileDefaultValues();
  const { user, profile, skills, projects } = profileData;

  if (!profile) {
    return {
      ...defaults,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      academicDeclarationAccepted: false,
      expectedGraduationYear: getCurrentYear(),
    };
  }

  return {
    ...defaults,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    universityId: profile.universityId,
    facultyId: profile.facultyId,
    specializationId: profile.specializationId,
    degreeLevel: profile.degreeLevel,
    studyMode: profile.studyMode ?? '',
    studyYear: profile.studyYear,
    expectedGraduationYear: profile.expectedGraduationYear ?? getCurrentYear(),
    hasTransferredSubjects: profile.hasTransferredSubjects ?? false,
    transferredSubjectsCount: profile.transferredSubjectsCount ?? undefined,
    profileSubjectsAverage: profile.profileSubjectsAverage ?? undefined,
    relevantCourses: profile.relevantCourses ?? [],
    academicAchievements: profile.academicAchievements ?? '',
    academicEvidenceFileId: profile.academicEvidenceFileId ?? '',
    academicDeclarationAccepted: Boolean(profile.academicDeclarationAcceptedAt),
    focusAreas: profile.focusAreas ?? [],
    preferredRoles: profile.preferredRoles ?? [],
    softSkills: (profile.softSkills ?? []) as StudentRegistrationValues['softSkills'],
    teamName: profile.teamName ?? '',
    githubUrl: profile.githubUrl ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    portfolioUrl: profile.portfolioUrl ?? '',
    cvFileId: profile.cvFileId ?? '',
    skills: skills.map((skill) => ({
      name: skill.name,
      level: skill.level,
      experienceMonths: skill.experienceMonths ?? undefined,
      isPrimary: skill.isPrimary,
    })),
    projects: projects.map((project) => ({
      title: project.title,
      description: project.description,
      role: project.role,
      technologies: project.technologies,
      projectUrl: project.projectUrl ?? '',
    })),
    bio: profile.bio ?? '',
  };
}

export function buildAcademicUpdatePayload(
  values: StudentRegistrationValues,
  academicEvidenceFileId?: string,
): UpdateAcademicInformationRequest {
  return {
    universityId: values.universityId,
    facultyId: values.facultyId,
    specializationId: values.specializationId,
    degreeLevel: values.degreeLevel,
    studyMode: toOptionalString(values.studyMode),
    studyYear: values.studyYear,
    expectedGraduationYear: values.expectedGraduationYear || undefined,
    hasTransferredSubjects: values.hasTransferredSubjects,
    transferredSubjectsCount: values.transferredSubjectsCount ?? undefined,
    profileSubjectsAverage: values.profileSubjectsAverage ?? undefined,
    relevantCourses: filterNonEmptyStrings(values.relevantCourses),
    academicAchievements: toOptionalString(values.academicAchievements),
    academicEvidenceFileId,
    academicDeclarationAccepted: values.academicDeclarationAccepted,
  };
}

export function buildProfessionalSkillsPayload(
  values: StudentRegistrationValues,
  cvFileId: string,
): UpdateProfessionalSkillsRequest {
  return {
    teamName: toOptionalString(values.teamName),
    focusAreas: values.focusAreas,
    preferredRoles: values.preferredRoles,
    softSkills: filterNonEmptyStrings(values.softSkills),
    githubUrl: toOptionalString(values.githubUrl),
    linkedinUrl: toOptionalString(values.linkedinUrl),
    portfolioUrl: toOptionalString(values.portfolioUrl),
    bio: toOptionalString(values.bio),
    cvFileId,
    skills: values.skills.map((skill) => ({
      ...skill,
      experienceMonths: skill.experienceMonths ?? undefined,
      level: skill.level,
    })),
    projects: values.projects.map((project) => ({
      ...project,
      technologies: filterNonEmptyStrings(project.technologies ?? []),
      projectUrl: toOptionalString(project.projectUrl),
    })),
  };
}

export function buildCompleteProfilePayload(
  values: StudentRegistrationValues,
): CompleteStudentProfileRequest {
  return {
    teamName: toOptionalString(values.teamName),
  };
}
