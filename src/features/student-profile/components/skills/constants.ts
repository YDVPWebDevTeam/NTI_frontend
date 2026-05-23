import type {
  UpdateProfessionalSkillsDtoFocusAreasItem,
  UpdateProfessionalSkillsDtoPreferredRolesItem,
  ProfessionalSkillInputDtoLevel,
  UpdateProfessionalSkillsDtoSoftSkillsItem,
} from 'lib/api';

export const FOCUS_AREA_OPTIONS: UpdateProfessionalSkillsDtoFocusAreasItem[] = [
  'SOFTWARE_DEVELOPMENT',
  'AI_AND_DATA',
  'WEB_APPLICATIONS',
  'GAME_DEVELOPMENT',
  'IOT_AND_EMBEDDED',
  'MOBILE_DEVELOPMENT',
  'DESKTOP_DEVELOPMENT',
  'QA_AND_TESTING',
  'DEVOPS_AND_INFRASTRUCTURE',
  'UI_UX_DESIGN',
  'PRODUCT_PROJECT_MANAGEMENT',
];

export const PREFERRED_ROLE_OPTIONS: UpdateProfessionalSkillsDtoPreferredRolesItem[] = [
  'FRONTEND',
  'BACKEND',
  'FULLSTACK',
  'MOBILE',
  'AI_DATA',
  'QA',
  'DEVOPS',
  'EMBEDDED',
  'GAME_DEV',
  'UI_UX',
  'PRODUCT_MANAGER',
  'TEAM_LEAD',
];

export const SKILL_LEVEL_OPTIONS: ProfessionalSkillInputDtoLevel[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
];

export const SOFT_SKILL_OPTIONS: UpdateProfessionalSkillsDtoSoftSkillsItem[] = [
  'TEAMWORK',
  'COMMUNICATION',
  'LEADERSHIP',
  'PRESENTATION',
  'PROBLEM_SOLVING',
  'TIME_MANAGEMENT',
  'PROJECT_COORDINATION',
];
