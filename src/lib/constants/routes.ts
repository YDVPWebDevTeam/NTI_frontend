const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER_STUDENT: '/register/student',
  REGISTER_COMPANY: '/register/company-owner',
  REGISTER_COMPANY_CONFIRM_EMAIL: '/register/company-owner/confirm-email',
  REGISTER_COMPANY_ORGANIZATION: '/register/company-owner/organization',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
  REGISTER_SELECT: '/register/select-role',
} as const;

const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  FORCE_CHANGE_PASSWORD: '/admin/force-change-password',
  ROOT: '/admin',
  USERS: '/admin/users',
  ACADEMIC_STRUCTURE: '/admin/academic-structure',
  ORGANIZATIONS: '/admin/organizations',
  ORGANIZATION_DETAILS: '/admin/organizations/[organizationId]',
  organizationDetails: (organizationId: string) => `/admin/organizations/${organizationId}`,
  INVITES: '/admin/invites',
} as const;

const STUDENT_ROUTES = {
  ROOT: '/student/dashboard',
  DASHBOARD: '/student/dashboard',
  PROFILE: '/student/profile',
  TEAM: '/student/team',
  APPLICATIONS: '/student/applications',
  PROGRAM_B_BACKLOG: '/student/program-b/backlog',
  PROGRAM_B_PROJECTS: '/student/program-b/projects',
  studentApplication: (applicationId: string) => `/student/applications/${applicationId}`,
  programBBacklogDetail: (backlogItemId: string) => `/student/program-b/backlog/${backlogItemId}`,
  programBProjectDetail: (projectId: string) => `/student/program-b/projects/${projectId}`,
} as const;

const COMPANY_ROUTES = {
  ROOT: '/company/dashboard',
  DASHBOARD: '/company/dashboard',
  ORGANIZATION: '/company/organization',
  PROGRAM_B_BACKLOG: '/company/program-b/backlog',
  PROGRAM_B_PROJECTS: '/company/program-b/projects',
  programBBacklogDetail: (backlogItemId: string) => `/company/program-b/backlog/${backlogItemId}`,
  programBProjectDetail: (projectId: string) => `/company/program-b/projects/${projectId}`,
} as const;

const MENTOR_ROUTES = {
  ROOT: '/mentor/dashboard',
  DASHBOARD: '/mentor/dashboard',
} as const;

const REVIEW_ROUTES = {
  ROOT: '/review/dashboard',
  DASHBOARD: '/review/dashboard',
} as const;

export const ROUTES = {
  ROOT: '/',
  TEAM_INVITE_ONBOARDING: '/invite',
  ONBOARDING_PROFILE: '/onboarding/profile',
  ORGANIZATION_INVITE_ONBOARDING: '/onboarding/invites',
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',

  HOME: {
    PROGRAMS: '/#programs',
    STARTUPS: '/#startups',
    MENTORS: '/#mentors',
    INFRASTRUCTURE: '/#infrastructure',
    NEWS: '/#news',
    LEARN_MORE: '/#about',
    CONTACT: '/#contact',
  },

  SOCIAL: {
    LINKEDIN: 'https://www.linkedin.com',
    TWITTER: 'https://x.com',
  },

  ADMIN: ADMIN_ROUTES,
  AUTH: AUTH_ROUTES,
  STUDENT: STUDENT_ROUTES,
  COMPANY: COMPANY_ROUTES,
  MENTOR: MENTOR_ROUTES,
  REVIEW: REVIEW_ROUTES,
} as const;
