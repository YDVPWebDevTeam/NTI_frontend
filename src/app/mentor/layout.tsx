'use client';

import { t } from '@lingui/core/macro';
import type { ReactNode } from 'react';
import { FolderKanban, LayoutGrid, ShieldCheck } from 'lucide-react';

import { InternalWorkspaceLayout } from 'components/workspace/internal-workspace-layout';
import { StudentStatusCard } from 'components/student-dashboard/page-shell-primitives';
import { UserRole } from 'lib/api';
import { ROUTES } from 'lib/constants';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

export default function MentorLayout({ children }: { children: ReactNode }) {
  const { isAllowed, isLoading, me } = useAuthenticatedUser([UserRole.MENTOR]);

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
    <InternalWorkspaceLayout
      user={me}
      title={t`Mentor workspace`}
      description={t`Guidance and project support`}
      navItems={[
        { href: ROUTES.MENTOR.DASHBOARD, label: t`Dashboard`, icon: LayoutGrid },
        {
          href: ROUTES.MENTOR.PROGRAM_B_PROJECTS,
          label: t`Program B projects`,
          icon: FolderKanban,
        },
        { href: ROUTES.ACCOUNT, label: t`Account security`, icon: ShieldCheck },
      ]}
    >
      {children}
    </InternalWorkspaceLayout>
  );
}
