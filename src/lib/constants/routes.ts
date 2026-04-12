const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER_STUDENT: '/register/student',
  REGISTER_COMPANY: '/register/company-partner',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
  REGISTER_SELECT: '/register/select-role',
} as const;

export const ROUTES = {
  ROOT: '/',
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

  AUTH: AUTH_ROUTES,
} as const;
