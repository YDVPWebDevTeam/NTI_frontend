export type FocusArea =
  | 'SOFTWARE_DEVELOPMENT'
  | 'AI_AND_DATA'
  | 'WEB_APPLICATIONS'
  | 'GAME_DEVELOPMENT'
  | 'IOT_AND_EMBEDDED'
  | 'MOBILE_DEVELOPMENT'
  | 'DESKTOP_DEVELOPMENT'
  | 'QA_AND_TESTING'
  | 'DEVOPS_AND_INFRASTRUCTURE'
  | 'UI_UX_DESIGN'
  | 'PRODUCT_PROJECT_MANAGEMENT'
  | (string & {});

export type PreferredRole =
  | 'FRONTEND'
  | 'BACKEND'
  | 'FULLSTACK'
  | 'MOBILE'
  | 'AI_DATA'
  | 'QA'
  | 'DEVOPS'
  | 'EMBEDDED'
  | 'GAME_DEV'
  | 'UI_UX'
  | 'PRODUCT_MANAGER'
  | 'TEAM_LEAD'
  | (string & {});

export type SoftSkill =
  | 'TEAMWORK'
  | 'COMMUNICATION'
  | 'LEADERSHIP'
  | 'PRESENTATION'
  | 'PROBLEM_SOLVING'
  | 'TIME_MANAGEMENT'
  | 'PROJECT_COORDINATION'
  | (string & {});

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | (string & {});

export interface ProfessionalSkillInput {
  name: string;
  level: SkillLevel;
  experienceMonths?: number;
  isPrimary?: boolean;
}

export interface ProfessionalProjectInput {
  title: string;
  description: string;
  role: string;
  technologies?: string[];
  projectUrl?: string;
}

export interface UpdateProfessionalSkillsRequest {
  focusAreas: FocusArea[];
  preferredRoles: PreferredRole[];
  softSkills?: SoftSkill[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  cvFileId: string;
  skills: ProfessionalSkillInput[];
  projects?: ProfessionalProjectInput[];
}

export type DegreeLevel = 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER' | (string & {});

export type StudyMode = 'FULL_TIME' | 'PART_TIME' | (string & {});

export interface UpdateAcademicInformationRequest {
  universityId: string;
  facultyId: string;
  specializationId: string;
  degreeLevel: DegreeLevel;
  studyMode?: StudyMode;
  studyYear: number;
  expectedGraduationYear?: number;
  hasTransferredSubjects: boolean;
  transferredSubjectsCount?: number;
  profileSubjectsAverage?: number;
  relevantCourses?: string[];
  academicAchievements?: string;
  academicEvidenceFileId?: string;
  academicDeclarationAccepted: boolean;
}

export interface StudentProfileUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface StudentProfileDto {
  id: string;
  universityId: string;
  facultyId: string;
  specializationId: string;
  degreeLevel: DegreeLevel;
  studyMode?: StudyMode;
  studyYear: number;
  expectedGraduationYear?: number;
  hasTransferredSubjects?: boolean;
  transferredSubjectsCount?: number;
  profileSubjectsAverage?: number;
  relevantCourses: string[];
  academicAchievements?: string;
  academicEvidenceFileId?: string;
  academicDeclarationAcceptedAt?: string;
  focusAreas: FocusArea[];
  preferredRoles: PreferredRole[];
  softSkills: SoftSkill[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  cvFileId?: string;
  profileCompletedAt?: string;
}

export interface StudentSkillDto {
  id: string;
  name: string;
  level: SkillLevel;
  experienceMonths?: number;
  isPrimary: boolean;
}

export interface StudentProjectDto {
  id: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  projectUrl?: string;
}

export interface StudentProfileCompletionDto {
  academicInformationCompleted: boolean;
  professionalSkillsCompleted: boolean;
  profileCompleted: boolean;
}

export interface GetMyStudentProfileResponse {
  user: StudentProfileUserDto;
  profile: StudentProfileDto | null;
  skills: StudentSkillDto[];
  projects: StudentProjectDto[];
  completion: StudentProfileCompletionDto;
}

export interface StudentProfileUpdateResponse {
  message?: string;
}
