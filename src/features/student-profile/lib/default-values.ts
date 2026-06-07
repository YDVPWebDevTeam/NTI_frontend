import { getCurrentYear } from 'lib/date';
import type { StudentRegistrationValues } from 'lib/auth/schemas';

export function getStudentProfileDefaultValues(): StudentRegistrationValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false,
    universityId: '',
    facultyId: '',
    specializationId: '',
    degreeLevel: '',
    studyMode: '',
    studyYear: 1,
    expectedGraduationYear: getCurrentYear(),
    hasTransferredSubjects: false,
    transferredSubjectsCount: undefined,
    profileSubjectsAverage: undefined,
    relevantCourses: [],
    academicAchievements: '',
    academicEvidenceFile: null,
    academicEvidenceFileId: '',
    academicDeclarationAccepted: false,
    focusAreas: [],
    preferredRoles: [],
    softSkills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    cvFileId: '',
    cvFile: null,
    skills: [],
    projects: [],
    bio: '',
  };
}
