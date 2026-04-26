import type { StudentRegistrationValues } from '../schema';
import { getCurrentYear } from 'lib/date';

export function getStudentRegistrationDefaultValues(): StudentRegistrationValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false,
    verificationCode: '',
    universityId: '',
    facultyId: '',
    specializationId: '',
    degreeLevel: '',
    studyMode: '',
    studyYear: 1,
    expectedGraduationYear: getCurrentYear(),
    hasTransferredSubjects: false,
    transferredSubjectsCount: 0,
    profileSubjectsAverage: 0,
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
