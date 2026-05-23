'use client';

import type { ReactNode } from 'react';

import { UserRole } from 'lib/api';
import { StudentStatusCard } from 'components/student-dashboard/page-shell-primitives';
import { StudentWorkspaceLayout } from 'components/student-dashboard/student-workspace-layout';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
import { StudentWorkspaceUserProvider } from 'lib/student-dashboard/student-workspace-user-context';

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { isAllowed, isLoading, me } = useAuthenticatedUser([UserRole.STUDENT]);

  if (isLoading || !me || !isAllowed) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title="Loading workspace"
          description="Resolving your authenticated workspace."
        />
      </main>
    );
  }

  return (
    <StudentWorkspaceUserProvider user={me}>
      <StudentWorkspaceLayout>{children}</StudentWorkspaceLayout>
    </StudentWorkspaceUserProvider>
  );
}
