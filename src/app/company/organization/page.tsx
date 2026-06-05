'use client';

import { t } from '@lingui/core/macro';

import { StudentStatusCard } from 'components/student-dashboard/page-shell-primitives';
import { OrganizationWorkspacePage } from 'features/organization-workspace/components/organization-workspace-page';
import { UserRole } from 'lib/api';
import { useAuthenticatedUser } from 'lib/student-dashboard/use-authenticated-user';

export default function CompanyOrganizationPage() {
  const { isLoading, me } = useAuthenticatedUser([
    UserRole.COMPANY_OWNER,
    UserRole.COMPANY_EMPLOYEE,
  ]);

  if (isLoading || !me) {
    return null;
  }

  if (me.role !== UserRole.COMPANY_OWNER) {
    return (
      <StudentStatusCard
        title={t`Organization access is owner-only`}
        description={t`Invitation management and organization administration stay scoped to the company owner account.`}
      />
    );
  }

  return <OrganizationWorkspacePage currentUser={me} />;
}
