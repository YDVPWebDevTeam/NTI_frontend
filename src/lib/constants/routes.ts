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
  ORGANIZATIONS: '/admin/organizations',
  ORGANIZATION_DETAILS: '/admin/organizations/[organizationId]',
  organizationDetails: (organizationId: string) => `/admin/organizations/${organizationId}`,
  INVITES: '/admin/invites',
} as const;

export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  ONBOARDING_INVITES: '/onboarding/invites',
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
  EU_FUNDING_DISCLOSURE: '/eu-funding-disclosure',

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
} as const;
