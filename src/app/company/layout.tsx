'use client';

import { t } from '@lingui/core/macro';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { UserRole, UserStatus } from 'lib/api';
import { CompanyWorkspaceLayout } from 'components/company-dashboard/company-workspace-layout';
import { StudentStatusCard } from 'components/student-dashboard/page-shell-primitives';
import { ROUTES } from 'lib/constants';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

const COMPANY_ALLOWED_ROLES = [UserRole.COMPANY_OWNER, UserRole.COMPANY_EMPLOYEE];

export default function CompanyLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAllowed, isLoading, me } = useAuthenticatedUser(COMPANY_ALLOWED_ROLES, {
    allowPending: true,
  });
  const isPendingCompanyOwner =
    me?.role === UserRole.COMPANY_OWNER && me.status === UserStatus.PENDING;

  useEffect(() => {
    if (!isPendingCompanyOwner) {
      return;
    }

    if (pathname === ROUTES.COMPANY.ORGANIZATION) {
      return;
    }

    router.replace(ROUTES.COMPANY.ORGANIZATION);
  }, [isPendingCompanyOwner, pathname, router]);

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

  if (isPendingCompanyOwner && pathname !== ROUTES.COMPANY.ORGANIZATION) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4">
        <StudentStatusCard
          title={t`Loading workspace`}
          description={t`Resolving your authenticated workspace.`}
        />
      </main>
    );
  }

  return <CompanyWorkspaceLayout user={me}>{children}</CompanyWorkspaceLayout>;
}
