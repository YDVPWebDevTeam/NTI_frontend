export const adminQueryKeys = {
  all: ['admin'] as const,
  authSession: () => [...adminQueryKeys.all, 'auth', 'session'] as const,
  authFlow: () => [...adminQueryKeys.all, 'auth', 'flow'] as const,
  users: () => [...adminQueryKeys.all, 'users'] as const,
  organizationInvites: () => [...adminQueryKeys.all, 'organization-invites'] as const,
  organizationInvitesByOrganization: (id: string) =>
    [...adminQueryKeys.organizationInvites(), id] as const,
} as const;
