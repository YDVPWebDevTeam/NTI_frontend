'use client';

import { t } from '@lingui/core/macro';
import { type ReactNode, Suspense } from 'react';

import { CompanyWorkspaceLayout } from 'components/company-dashboard/company-workspace-layout';
import { StudentStatusCard } from 'components/student-dashboard/page-shell-primitives';
import { StudentWorkspaceLayout } from 'components/student-dashboard/student-workspace-layout';
import { InternalWorkspaceLayout } from 'components/workspace/internal-workspace-layout';
import { AccountSettingsPage } from 'features/account-settings/components/account-settings-page';
import { UserRole, type AuthenticatedUserDto, type UserRole as UserRoleType } from 'lib/api';
import { isMentorRole, isOrganizationRole, isReviewRole, isStudentRole } from 'lib/auth/access';
import { ROUTES } from 'lib/constants';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';
import { StudentWorkspaceUserProvider } from 'lib/student-dashboard/student-workspace-user-context';
import { FolderKanban, LayoutGrid, ShieldCheck } from 'lucide-react';

const ACCOUNT_ALLOWED_ROLES: UserRoleType[] = [
  UserRole.STUDENT,
  UserRole.COMPANY_OWNER,
  UserRole.COMPANY_EMPLOYEE,
  UserRole.MENTOR,
  UserRole.EVALUATOR,
];

function renderInternalWorkspace(me: AuthenticatedUserDto, content: ReactNode) {
  if (isMentorRole(me.role)) {
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
        {content}
      </InternalWorkspaceLayout>
    );
  }

  if (isReviewRole(me.role)) {
    return (
      <InternalWorkspaceLayout
        user={me}
        title={t`Review workspace`}
        description={t`Evaluation queue and review flows`}
        navItems={[
          { href: ROUTES.REVIEW.DASHBOARD, label: t`Dashboard`, icon: LayoutGrid },
          { href: ROUTES.ACCOUNT, label: t`Account security`, icon: ShieldCheck },
        ]}
      >
        {content}
      </InternalWorkspaceLayout>
    );
  }

  return null;
}

export default function AccountPage() {
  const { isAllowed, isLoading, me } = useAuthenticatedUser(ACCOUNT_ALLOWED_ROLES, {
    preservePathOnAuthRedirect: true,
  });

  if (isLoading || !me || !isAllowed) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title={t`Loading workspace`}
          description={t`Resolving your authenticated workspace.`}
        />
      </main>
    );
  }

  const accountContent = (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
          <StudentStatusCard
            title={t`Loading workspace`}
            description={t`Resolving your authenticated workspace.`}
          />
        </main>
      }
    >
      <AccountSettingsPage user={me} />
    </Suspense>
  );

  if (isStudentRole(me.role)) {
    return (
      <StudentWorkspaceUserProvider user={me}>
        <StudentWorkspaceLayout>{accountContent}</StudentWorkspaceLayout>
      </StudentWorkspaceUserProvider>
    );
  }

  if (isOrganizationRole(me.role)) {
    return <CompanyWorkspaceLayout user={me}>{accountContent}</CompanyWorkspaceLayout>;
  }

  const internalWorkspace = renderInternalWorkspace(me, accountContent);

  if (internalWorkspace) {
    return internalWorkspace;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
      <StudentStatusCard
        title={t`Account settings unavailable`}
        description={t`This account type does not currently have a self-service account settings workspace.`}
      />
    </main>
  );
}
