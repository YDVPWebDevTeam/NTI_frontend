export const adminQueryKeys = {
  all: ['admin'] as const,
  academicStructure: () => [...adminQueryKeys.all, 'academic-structure'] as const,
  academicStructureUniversities: (query: { search?: string; includeInactive?: boolean }) =>
    [
      ...adminQueryKeys.academicStructure(),
      'universities',
      query.search ?? '',
      Boolean(query.includeInactive),
    ] as const,
  academicStructureFaculties: (universityId: string, includeInactive: boolean) =>
    [
      ...adminQueryKeys.academicStructure(),
      'universities',
      universityId,
      'faculties',
      includeInactive,
    ] as const,
  academicStructureSpecializations: (facultyId: string, includeInactive: boolean) =>
    [
      ...adminQueryKeys.academicStructure(),
      'faculties',
      facultyId,
      'specializations',
      includeInactive,
    ] as const,
  authSession: () => [...adminQueryKeys.all, 'auth', 'session'] as const,
  authFlow: () => [...adminQueryKeys.all, 'auth', 'flow'] as const,
  users: () => [...adminQueryKeys.all, 'users'] as const,
  organizationInvites: () => [...adminQueryKeys.all, 'organization-invites'] as const,
  organizationInvitesByOrganization: (id: string) =>
    [...adminQueryKeys.organizationInvites(), id] as const,
} as const;
