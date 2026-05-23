'use client';

import { createContext, use } from 'react';
import type { ReactNode } from 'react';

import type { AuthenticatedUserDto } from 'lib/api';

const StudentWorkspaceUserContext = createContext<AuthenticatedUserDto | null>(null);

export function StudentWorkspaceUserProvider({
  user,
  children,
}: {
  user: AuthenticatedUserDto;
  children: ReactNode;
}) {
  return (
    <StudentWorkspaceUserContext.Provider value={user}>
      {children}
    </StudentWorkspaceUserContext.Provider>
  );
}

export function useStudentWorkspaceUser() {
  const user = use(StudentWorkspaceUserContext);

  if (!user) {
    throw new Error('useStudentWorkspaceUser must be used within StudentWorkspaceUserProvider.');
  }

  return user;
}
