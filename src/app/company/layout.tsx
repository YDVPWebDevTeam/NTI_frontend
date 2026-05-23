'use client';

import type { ReactNode } from 'react';

import { UserRole } from 'lib/api';
import { CompanyWorkspaceLayout } from 'components/company-dashboard/company-workspace-layout';
import { StudentStatusCard } from 'components/student-dashboard/page-shell-primitives';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

const COMPANY_ALLOWED_ROLES = [UserRole.COMPANY_OWNER, UserRole.COMPANY_EMPLOYEE];

export default function CompanyLayout({ children }: { children: ReactNode }) {
  const { isAllowed, isLoading, me } = useAuthenticatedUser(COMPANY_ALLOWED_ROLES);

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

  return <CompanyWorkspaceLayout user={me}>{children}</CompanyWorkspaceLayout>;
}
